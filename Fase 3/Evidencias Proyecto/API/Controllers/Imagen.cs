using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Web.Http;
using ServiMapp.API.Security;
using ServiMapp.API.Models; 

namespace ServiMapp.API.Controllers
{
    [RoutePrefix("api/imagen")]
    public class ImagenController : ApiController
    {
        private readonly string _cn = ConfigurationManager
            .ConnectionStrings["SqlServer"].ConnectionString;

        [Authorize]
        [ApiKey]
        [HttpPost, Route("consulta/solicitudservicio")]
        public async Task<IHttpActionResult> ConsultarImagenesSolicitud([FromBody] SolicitudServicioConsultaImagenRequest dto)
        {
            if (dto == null || dto.Id_SolicitudServicio <= 0)
                return BadRequest("Solicitud incompleta");

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("SolicitudServicioConsultaImagen", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.Add("@Id_SolicitudServicio", SqlDbType.BigInt)
                                  .Value = dto.Id_SolicitudServicio;

                    await cn.OpenAsync().ConfigureAwait(false);

                    using (var da = new SqlDataAdapter(cmd))
                    {
                        var ds = new DataSet();
                        da.Fill(ds);

                        if (ds.Tables.Count == 0)
                            return Ok(new object[0]);

                        return Ok(ds.Tables[0]);
                        // IMG_Imagen (VARBINARY) se serializa como Base64 automáticamente en JSON
                    }
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception(
                    $"Error al consultar imágenes: {ex.Message}"
                ));
            }
        }

        [Authorize]
        [ApiKey]
        [HttpPost, Route("insertar")]
        public async Task<IHttpActionResult> InsertarImagen([FromBody] ImagenInsertarRequest dto)
        {
            if (dto == null)
                return BadRequest("Body vacío");

            if (dto.Id_Usuario <= 0)
                return BadRequest("Id_Usuario inválido");

            if (string.IsNullOrWhiteSpace(dto.IMG_Archivo))
                return BadRequest("IMG_Archivo es requerido");

            if (string.IsNullOrWhiteSpace(dto.IMG_Base64))
                return BadRequest("IMG_Base64 es requerido");

            // Opcional: si no quieres permitir ambos
            if (dto.Id_SolicitudServicio.HasValue && dto.Id_Servicio.HasValue)
                return BadRequest("No pueden venir Id_SolicitudServicio e Id_Servicio juntos");

            byte[] bytes;
            try
            {
                bytes = Convert.FromBase64String(dto.IMG_Base64);
            }
            catch
            {
                return BadRequest($"Base64 inválido en archivo {dto.IMG_Archivo}");
            }

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("InsertarImagen", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.Add("@IMG_Archivo", SqlDbType.VarChar, 260)
                                  .Value = dto.IMG_Archivo;

                    cmd.Parameters.Add("@IMG_Imagen", SqlDbType.VarBinary, -1)
                                  .Value = bytes;

                    cmd.Parameters.Add("@Id_Usuario", SqlDbType.BigInt)
                                  .Value = dto.Id_Usuario;

                    cmd.Parameters.Add("@Id_SolicitudServicio", SqlDbType.BigInt)
                                  .Value = (object)dto.Id_SolicitudServicio ?? DBNull.Value;

                    cmd.Parameters.Add("@Id_Servicio", SqlDbType.BigInt)
                                  .Value = (object)dto.Id_Servicio ?? DBNull.Value;

                    await cn.OpenAsync().ConfigureAwait(false);
                    await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);

                    return Ok(new { Exito = true });
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception(
                    $"Error al insertar imagen: {ex.Message}"
                ));
            }
        }

        [Authorize]
        [ApiKey]
        [HttpPost, Route("borrar")]
        public async Task<IHttpActionResult> BorrarImagenPerfil([FromBody] BorrarImagenPerfilRequest dto)
        {
            if (dto == null || dto.Id_Usuario <= 0)
                return BadRequest("Solicitud incompleta");

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("BorrarImagenPerfil", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.Add("@Id_Usuario", SqlDbType.BigInt)
                                  .Value = dto.Id_Usuario;

                    var exitoParam = cmd.Parameters.Add("@Exito", SqlDbType.Bit);
                    exitoParam.Direction = ParameterDirection.Output;

                    await cn.OpenAsync().ConfigureAwait(false);

                    await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);

                    // Leer el bool desde el parámetro de salida
                    bool exito = exitoParam.Value != DBNull.Value && (bool)exitoParam.Value;

                    return Ok(new
                    {
                        Exito = exito,
                        Mensaje = exito
                            ? "Imagen de perfil borrada correctamente."
                            : "No se encontró imagen de perfil para borrar."
                    });
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception(
                    $"Error al borrar imagen de perfil: {ex.Message}"
                ));
            }
        }
    }
}