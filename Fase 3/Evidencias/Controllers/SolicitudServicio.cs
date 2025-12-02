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
    [RoutePrefix("api/solicitudes")]
    public class SolicitudServicioController : ApiController
    {
        private readonly string _cn = ConfigurationManager
            .ConnectionStrings["SqlServer"].ConnectionString;

        [Authorize]
        [ApiKey]
        [HttpPost, Route("crear")]
        public async Task<IHttpActionResult> CrearSolicitud([FromBody] SolicitudServicioCrearRequest dto)
        {
            if (dto == null)
                return BadRequest("Datos de solicitud requeridos");

            try
            {
                bool exito = false;

                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("SolicitudServicioCrear", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    // Parámetros de entrada
                    cmd.Parameters.Add("@Id_Usuario", SqlDbType.BigInt).Value = dto.Id_Usuario;
                    cmd.Parameters.Add("@Id_Categoria", SqlDbType.BigInt).Value = dto.Id_Categoria;
                    cmd.Parameters.Add("@Id_Comuna", SqlDbType.BigInt).Value = dto.Id_Comuna;
                    cmd.Parameters.Add("@SS_FechaServicio", SqlDbType.DateTime).Value = dto.SS_FechaServicio;
                    cmd.Parameters.Add("@SS_Titulo", SqlDbType.VarChar, 250).Value = dto.SS_Titulo;
                    cmd.Parameters.Add("@SS_Descripcion", SqlDbType.VarChar, -1).Value = dto.SS_Descripcion; // -1 = MAX
                    
                    // Parámetros decimales con precisión
                    var pLatitud = cmd.Parameters.Add("@SS_Latitud", SqlDbType.Decimal);
                    pLatitud.Precision = 10;
                    pLatitud.Scale = 8;
                    pLatitud.Value = dto.SS_Latitud;

                    var pLongitud = cmd.Parameters.Add("@SS_Longitud", SqlDbType.Decimal);
                    pLongitud.Precision = 11;
                    pLongitud.Scale = 8;
                    pLongitud.Value = dto.SS_Longitud;

                    cmd.Parameters.Add("@SS_Contacto", SqlDbType.BigInt).Value = dto.SS_Contacto;
                    cmd.Parameters.Add("@SS_Direccion", SqlDbType.VarChar, -1).Value = dto.SS_Direccion;
                    cmd.Parameters.Add("@SS_FechaExpira", SqlDbType.DateTime).Value = dto.SS_FechaExpira;

                    // Imagenes (TIPO TABLA)

                    // 1) Crear DataTable con la misma estructura del TYPE dbo.TVP_ImagenSolicitudServicio
                    var tvp = new DataTable();
                    tvp.Columns.Add("IMG_Archivo", typeof(string));
                    tvp.Columns.Add("IMG_Imagen", typeof(byte[]));

                    // 2) Llenarlo con la lista dto.Imagenes
                    if (dto.Imagenes != null)
                    {
                        foreach (var img in dto.Imagenes)
                        {
                            if (img == null) continue;
                            if (string.IsNullOrWhiteSpace(img.IMG_Archivo)) continue;
                            if (string.IsNullOrWhiteSpace(img.IMG_Base64)) continue;

                            byte[] bytes;
                            try
                            {
                                bytes = Convert.FromBase64String(img.IMG_Base64);
                            }
                            catch
                            {
                                return BadRequest($"Base64 inválido en archivo {img.IMG_Archivo}");
                            }

                            tvp.Rows.Add(img.IMG_Archivo, bytes);
                        }
                    }

                    // 3) Pasar el TVP al SP
                    var pImgs = cmd.Parameters.AddWithValue("@Imagenes", tvp);
                    pImgs.SqlDbType = SqlDbType.Structured;
                    pImgs.TypeName = "dbo.TVP_ImagenSolicitudServicio";

                    // Parámetro de salida
                    var pExito = cmd.Parameters.Add("@Exito", SqlDbType.Bit);
                    pExito.Direction = ParameterDirection.Output;

                    await cn.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();

                    exito = (pExito.Value != DBNull.Value) && (bool)pExito.Value;
                }

                if (!exito)
                    return BadRequest("No se pudo crear la solicitud de servicio");

                return Ok(new
                {
                    exito = true,
                    mensaje = "Solicitud creada exitosamente"
                });
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception($"Error al crear solicitud: {ex.Message}"));
            }
        }

        [Authorize]
        [ApiKey]
        [HttpPost, Route("listar/usuario")]
        public async Task<IHttpActionResult> ConsultarSolicitudesUsuario([FromBody] SolicitudServicioConsultarRequest dto)
        {
            if (dto == null || dto.Id_Usuario <= 0)
                return BadRequest("Id de usuario requerido");

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("SolicitudServicioConsultaUsuario", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    // Parámetro de entrada
                    cmd.Parameters.Add("@Id_Usuario", SqlDbType.BigInt).Value = dto.Id_Usuario;

                    await cn.OpenAsync().ConfigureAwait(false);

                    using (var da = new SqlDataAdapter(cmd))
                    {
                        var ds = new DataSet();
                        da.Fill(ds);

                        if (ds.Tables.Count == 0)
                            return Ok(new object[0]);

                        var dt = ds.Tables[0];
                        return Ok(dt);
                    }
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception($"Error al consultar solicitudes: {ex.Message}"));
            }
        }

        [Authorize]
        [ApiKey]
        [HttpPost, Route("listar/general")]
        public async Task<IHttpActionResult> ConsultarSolicitudesGeneral([FromBody] SolicitudServicioConsultarRequest dto)
        {
            if (dto == null || dto.Id_Usuario <= 0)
                return BadRequest("Id de usuario requerido");

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("SolicitudServicioConsulta", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    // Parámetro de entrada
                    cmd.Parameters.Add("@Id_Usuario", SqlDbType.BigInt).Value = dto.Id_Usuario;

                    await cn.OpenAsync().ConfigureAwait(false);

                    using (var da = new SqlDataAdapter(cmd))
                    {
                        var ds = new DataSet();
                        da.Fill(ds);

                        if (ds.Tables.Count == 0)
                            return Ok(new object[0]);

                        var dt = ds.Tables[0];
                        return Ok(dt);
                    }
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception($"Error al consultar solicitudes: {ex.Message}"));
            }
        }

        [Authorize]
        [ApiKey]
        [HttpPost, Route("cancelar")]
        public async Task<IHttpActionResult> CancelarSolicitud([FromBody] SolicitudServicioCancelarRequest dto)
        {
            if (dto == null || dto.Id_SolicitudServicio <= 0)
                return BadRequest("No se encontro la solicitud.");

            bool exito;

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("SolicitudServicioCancelar", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    // Parámetro de entrada
                    cmd.Parameters.Add("@Id_SolicitudServicio", SqlDbType.BigInt).Value = dto.Id_SolicitudServicio;

                    // Parámetro de salida
                    var pExito = cmd.Parameters.Add("@Exito", SqlDbType.Bit);
                    pExito.Direction = ParameterDirection.Output;

                    await cn.OpenAsync().ConfigureAwait(false);
                    await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);

                    exito = (pExito.Value != DBNull.Value) && (bool)pExito.Value;
                }

                if (!exito)
                {
                    return BadRequest("No se pudo cancelar la solicitud.");
                }

                // Éxito
                return Ok(new { Exito = exito });
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception($"Error al solicitud oferta: {ex.Message}", ex));
            }
        }
    }
}