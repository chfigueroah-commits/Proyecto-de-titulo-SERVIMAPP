using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System;
using ServiMapp.API.Models;
using ServiMapp.API.Security;

namespace ServiMapp.API.Controllers
{

    [RoutePrefix("usuario/autenticar")]
    public class AuthController : ApiController
    {
        private readonly string _cn = ConfigurationManager
            .ConnectionStrings["SqlServer"].ConnectionString;

        static string Sha256(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                throw new ArgumentException("El texto no puede estar vacío.", nameof(text));

            using (var sha = SHA256.Create())
            {
                var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(text));
                var sb = new StringBuilder(bytes.Length * 2);
                foreach (var b in bytes) sb.Append(b.ToString("X2")); // HEX mayúsculas
                return sb.ToString();
            }
        }

        // POST /api/autenticar/login
        [ApiKey]
        [HttpPost, Route("login")]
        public async Task<IHttpActionResult> Autenticar([FromBody] LoginRequest dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest("Email y Password requeridos.");

            dynamic user = null;  
            bool ok = false;

            using (var cn = new SqlConnection(_cn))
            using (var cmd = new SqlCommand("UsuarioAutenticar", cn))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                var emailNorm = dto.Email.Trim().ToLower();
                cmd.Parameters.Add("@Email", SqlDbType.VarChar, 50).Value = emailNorm;

                // Usa Sha256(dto.Password) SOLO si en BD guardaste hash.
                cmd.Parameters.Add("@Password", SqlDbType.VarChar, 250).Value = Sha256(dto.Password);

                var pOk = cmd.Parameters.Add("@Exito", SqlDbType.Bit);
                pOk.Direction = ParameterDirection.Output;

                await cn.OpenAsync();

                // Importante: como el SP devuelve un SELECT (datos del usuario),
                // usamos ExecuteReader para leer ese resultset:
                using (var rd = await cmd.ExecuteReaderAsync())
                {
                    if (rd.HasRows && await rd.ReadAsync())
                    {
                        user = new
                        {
                            UsuarioId = rd["UsuarioId"] is DBNull ? 0 : Convert.ToInt32(rd["UsuarioId"]),
                            Nombre = rd["Nombre"] as string,
                            Apellido = rd["Apellido"] as string,
                            Rut = rd["Rut"] as string,
                            Correo = rd["Correo"] as string,
                            Telefono = rd["Telefono"] as string,
                            FechaNacimiento = rd["FechaNacimiento"] as DateTime?,
                            FechaRegistro = rd["FechaRegistro"] as DateTime?,
                            Activo = rd["Activo"] is DBNull ? false : Convert.ToBoolean(rd["Activo"]),
                            Biografia = rd["Biografia"] as string,
                            Admin = rd["Admin"] is DBNull ? false : Convert.ToBoolean(rd["Admin"]),
                        };
                    }
                } 

                ok = (pOk.Value != DBNull.Value) && (bool)pOk.Value;
            }

            if (!ok) return Unauthorized();
            if (user == null) return InternalServerError(new Exception("SP no devolvió datos del usuario."));

            var token = JwtHelper.CreateToken(user.UsuarioId.ToString(), user.Correo);
            return Ok(new
            {
                access_token = token,
                token_type = "Bearer",
                usuario = user
            });
        }
    }
}
