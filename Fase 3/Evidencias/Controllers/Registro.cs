using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using ServiMapp.API.Models;
using ServiMapp.API.Security;

namespace ServiMapp.API.Controllers
{
    [RoutePrefix("usuario/registro")]
    public class RegisterController : ApiController
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
        [ApiKey]
        [HttpPost, Route("register")]
        public async Task<IHttpActionResult> Registro([FromBody] RegistroRequest dto)
        {
            if (dto == null)
                return BadRequest("Parametros vacios");

            bool exito = false;

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("UsuarioCrear", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.Add("@Nombre", SqlDbType.VarChar, 50).Value = dto.Nombre?.Trim();
                    cmd.Parameters.Add("@Apellido", SqlDbType.VarChar, 50).Value = dto.Apellido?.Trim();
                    cmd.Parameters.Add("@RUT", SqlDbType.VarChar, 12).Value = dto.Rut?.Trim();
                    cmd.Parameters.Add("@Correo", SqlDbType.VarChar, 100).Value = dto.Correo?.Trim();

                    // Si ya tienes hash SHA256 u otro, úsalo aquí; si no, va tal cual:
                    cmd.Parameters.Add("@Contrasena", SqlDbType.VarChar, 200).Value = Sha256(dto.Contrasena?.Trim());
                    cmd.Parameters.Add("@Telefono", SqlDbType.VarChar, 9).Value = dto.Telefono?.Trim();
                    cmd.Parameters.Add("@FechaNacimiento", SqlDbType.Date).Value = dto.FechaNacimiento;

                    // OUTPUT @Exito
                    var pExito = cmd.Parameters.Add("@Exito", SqlDbType.Bit);
                    pExito.Direction = ParameterDirection.Output;

                    await cn.OpenAsync().ConfigureAwait(false);
                    await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);

                    exito = (pExito.Value != DBNull.Value) && (bool)pExito.Value;

                }
            }
            catch (Exception ex)
            {
                // En producción, loguea el error y devuelve un mensaje genérico
                return InternalServerError(ex);
            }

            return Ok(new { exito });
        }
    }
}
