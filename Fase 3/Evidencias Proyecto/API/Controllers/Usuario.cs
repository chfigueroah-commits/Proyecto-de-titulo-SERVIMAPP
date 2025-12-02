using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using ServiMapp.API.Models;
using ServiMapp.API.Security;

namespace ServiMapp.API.Controllers
{
    [RoutePrefix("usuario")]
    public class UsuarioController : ApiController
    {
        private readonly string _cn = ConfigurationManager
            .ConnectionStrings["SqlServer"].ConnectionString;   

        [Authorize]
        [ApiKey]
        [HttpPost, Route("actualiza")]
        public async Task<IHttpActionResult> ActualizaUsuario([FromBody] UsuarioActualizarRequest dto)
        {
            if (dto == null || dto.Id_Usuario <= 0)
                return BadRequest("Id de usuario requerido");

            try
            {
                bool exito = false;

                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("UsuarioActualiza", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.Add("@Id_Usuario", SqlDbType.BigInt).Value = dto.Id_Usuario;
                    cmd.Parameters.Add("@US_Biografia", SqlDbType.VarChar).Value = dto.US_Biografia;
                    cmd.Parameters.Add("@US_Telefono", SqlDbType.VarChar).Value = dto.US_Telefono;
                    cmd.Parameters.Add("@Id_Profesion", SqlDbType.BigInt).Value = dto.Id_Profesion;

                    // parámetro OUTPUT
                    var pExito = cmd.Parameters.Add("@Exito", SqlDbType.Bit);
                    pExito.Direction = ParameterDirection.Output;

                    await cn.OpenAsync().ConfigureAwait(false);
                    await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);

                    exito = (pExito.Value != DBNull.Value) && (bool)pExito.Value;
                }

                if (!exito)
                    return BadRequest("No se actualizó ningún registro");

                return Ok(new { exito = true, mensaje = "Usuario actualizado" });
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception($"Error al actualizar usuario: {ex.Message}"));
            }
        }


        [Authorize]
        [ApiKey]
        [HttpPost, Route("consulta")] 
        public async Task<IHttpActionResult> ConsultaUsuario([FromBody] UsuarioConsultarRequest dto)
        {
            if (dto == null || !dto.Id_Usuario.HasValue || dto.Id_Usuario.Value <= 0)
                return BadRequest("Id de usuario requerido");

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("UsuarioConsulta", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.Add("@Id_Usuario", SqlDbType.BigInt)
                                  .Value = dto.Id_Usuario.Value;

                    await cn.OpenAsync().ConfigureAwait(false);

                    using (var rd = await cmd.ExecuteReaderAsync().ConfigureAwait(false))
                    {
                        var dt = new DataTable();
                        dt.Load(rd);

                        if (dt.Rows.Count == 0)
                            return NotFound();

                        return Ok(dt);
                    }
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception($"Error al consultar usuario: {ex.Message}"));
            }
        }
    }
}
