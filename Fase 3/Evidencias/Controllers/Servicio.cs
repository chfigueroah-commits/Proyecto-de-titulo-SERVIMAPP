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
    [RoutePrefix("servicio")]
    public class ServicioController : ApiController
    {
        private readonly string _cn = ConfigurationManager
            .ConnectionStrings["SqlServer"].ConnectionString;

        [Authorize]
        [ApiKey]
        [HttpPost, Route("crear")]
        public async Task<IHttpActionResult> CrearServicio([FromBody] ServicioCrearRequest dto)
        {
            if (dto == null)
                return BadRequest("Datos del servicio requeridos");

            // Validaciones básicas
            if (dto.Id_SolicitudServicio <= 0)
                return BadRequest("Id_SolicitudServicio inválido.");
            if (dto.Id_Oferta <= 0)
                return BadRequest("Id_Oferta inválido.");
            if (dto.Id_Usuario <= 0)
                return BadRequest("Id_Usuario inválido.");

            try
            {
                bool exito = false;

                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("ServicioCrear", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    // Parámetros de entrada (coinciden con el SP)
                    cmd.Parameters.Add("@Id_SolicitudServicio", SqlDbType.BigInt).Value = dto.Id_SolicitudServicio;
                    cmd.Parameters.Add("@Id_Oferta", SqlDbType.BigInt).Value = dto.Id_Oferta;
                    cmd.Parameters.Add("@Id_Usuario", SqlDbType.BigInt).Value = dto.Id_Usuario;
                    cmd.Parameters.Add("@SE_FechaModifica", SqlDbType.DateTime).Value = DateTime.Now;

                    // Parámetro de salida
                    var pExito = cmd.Parameters.Add("@Exito", SqlDbType.Bit);
                    pExito.Direction = ParameterDirection.Output;

                    await cn.OpenAsync().ConfigureAwait(false);
                    await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);

                    exito = (pExito.Value != DBNull.Value) && (bool)pExito.Value;
                }

                if (!exito)
                    return BadRequest("No se pudo crear el servicio.");

                return Ok(new
                {
                    exito = true,
                });
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception($"Error al crear servicio: {ex.Message}", ex));
            }
        }
    
        [Authorize]
        [ApiKey]
        [HttpPost, Route("listar/cliente")]
        public async Task<IHttpActionResult> ConsultarServiciosCliente([FromBody] ServicioConsultarUsuarioRequest dto)
        {
            if (dto == null || dto.Id_Usuario <= 0)
                return BadRequest("Id de usuario requerido");

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("ServicioConsultaCliente", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
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
                return InternalServerError(new Exception($"Error al consultar servicios del cliente: {ex.Message}"));
            }
        }

        [Authorize]
        [ApiKey]
        [HttpPost, Route("listar/proveedor")]
        public async Task<IHttpActionResult> ConsultarServiciosProveedor([FromBody] ServicioConsultarUsuarioRequest dto)
        {
            if (dto == null || dto.Id_Usuario <= 0)
                return BadRequest("Id de usuario requerido");

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("ServicioConsultaProveedor", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
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
                return InternalServerError(new Exception($"Error al consultar servicios del proveedor: {ex.Message}"));
            }
        }

        [Authorize]
        [ApiKey]
        [HttpPost, Route("consulta/id")]
        public async Task<IHttpActionResult> ConsultarServicioPorId([FromBody] ServicioConsultarPorIdRequest dto)
        {
            if (dto == null || dto.Id_Servicio <= 0)
                return BadRequest("Id de servicio requerido");

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("ServicioConsulta", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add("@Id_Servicio", SqlDbType.BigInt).Value = dto.Id_Servicio;

                    await cn.OpenAsync().ConfigureAwait(false);

                    using (var da = new SqlDataAdapter(cmd))
                    {
                        var ds = new DataSet();
                        da.Fill(ds);

                        if (ds.Tables.Count == 0)
                            return Ok(new object[0]);

                        var dt = ds.Tables[0];

                        if (dt.Rows.Count == 0)
                            return Ok(new object[0]);

                        return Ok(dt);
                    }
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception($"Error al consultar servicio: {ex.Message}"));
            }
        }

        [Authorize]
        [ApiKey]
        [HttpPost, Route("cancelar")]
        public async Task<IHttpActionResult> CancelarServicio([FromBody] ServicioCancelarRequest dto)
        {
            if (dto == null || dto.Id_Servicio <= 0)
                return BadRequest("Id de servicio requerido");

            if (dto.Id_Usuario <= 0)
                return BadRequest("Id de usuario requerido");

            if (string.IsNullOrWhiteSpace(dto.SE_Comentario))
                return BadRequest("El motivo de cancelación es requerido");

            bool exito = false;

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("ServicioCancelar", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    // Parámetros de entrada
                    cmd.Parameters.Add("@Id_Servicio", SqlDbType.BigInt).Value = dto.Id_Servicio;
                    cmd.Parameters.Add("@Id_Usuario", SqlDbType.BigInt).Value = dto.Id_Usuario;
                    cmd.Parameters.Add("@SE_Comentario", SqlDbType.NVarChar, -1).Value = dto.SE_Comentario; // -1 = MAX

                    // Parámetro de salida
                    var pExito = cmd.Parameters.Add("@Exito", SqlDbType.Bit);
                    pExito.Direction = ParameterDirection.Output;

                    await cn.OpenAsync().ConfigureAwait(false);
                    await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);

                    exito = (pExito.Value != DBNull.Value) && (bool)pExito.Value;
                }

                if (!exito)
                {
                    return BadRequest("No se pudo cancelar el servicio.");
                }

                return Ok(new { Exito = exito });
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception($"Error al cancelar servicio: {ex.Message}", ex));
            }
        }

        [Authorize]
        [ApiKey]
        [HttpPost, Route("comprobante/insertar")]
        public async Task<IHttpActionResult> InsertarComprobantePago([FromBody] ComprobantePagoInsertarRequest dto)
        {
            if (dto == null || dto.Id_Servicio <= 0)
                return BadRequest("Id de servicio requerido");

            if (dto.Id_Usuario <= 0)
                return BadRequest("Id de usuario requerido");

            bool exito = false;
            long? idComprobante = null;

            try
            {
                using (var cn = new SqlConnection(_cn))
                {
                    await cn.OpenAsync().ConfigureAwait(false);

                    // Insertar el comprobante con imágenes
                    using (var cmd = new SqlCommand("ComprobantePagoInsertar", cn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.Add("@Id_Servicio", SqlDbType.BigInt).Value = dto.Id_Servicio;
                        cmd.Parameters.Add("@Id_Usuario", SqlDbType.BigInt).Value = dto.Id_Usuario;
                        cmd.Parameters.Add("@CP_Comentario", SqlDbType.NVarChar, -1).Value = 
                            (object)dto.CP_Comentario ?? DBNull.Value;

                        // Imágenes (TIPO TABLA)
                        var tvp = new DataTable();
                        tvp.Columns.Add("IMG_Archivo", typeof(string));
                        tvp.Columns.Add("IMG_Imagen", typeof(byte[]));

                        // Llenar el TVP con las imágenes
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

                        // Pasar el TVP al SP
                        var pImgs = cmd.Parameters.AddWithValue("@Imagenes", tvp);
                        pImgs.SqlDbType = SqlDbType.Structured;
                        pImgs.TypeName = "dbo.TVP_ImagenSolicitudServicio";

                        var pExito = cmd.Parameters.Add("@Exito", SqlDbType.Bit);
                        pExito.Direction = ParameterDirection.Output;

                        await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);

                        exito = (pExito.Value != DBNull.Value) && (bool)pExito.Value;
                    }

                    if (!exito)
                        return BadRequest("No se pudo insertar el comprobante de pago.");

                    // Obtener el Id del comprobante recién creado
                    using (var cmd = new SqlCommand("SELECT MAX(Id_ComprobantePago) FROM ComprobantePago WHERE Id_Servicio = @Id_Servicio", cn))
                    {
                        cmd.Parameters.Add("@Id_Servicio", SqlDbType.BigInt).Value = dto.Id_Servicio;
                        var result = await cmd.ExecuteScalarAsync().ConfigureAwait(false);
                        if (result != null && result != DBNull.Value)
                            idComprobante = Convert.ToInt64(result);
                    }
                }

                return Ok(new 
                { 
                    Exito = exito,
                    Id_ComprobantePago = idComprobante
                });
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception($"Error al insertar comprobante de pago: {ex.Message}", ex));
            }
        }

        [Authorize]
        [ApiKey]
        [HttpPost, Route("comprobante/consultar")]
        public async Task<IHttpActionResult> ConsultarComprobantePago([FromBody] ComprobantePagoConsultarRequest dto)
        {
            if (dto == null || dto.Id_Servicio <= 0)
                return BadRequest("Id de servicio requerido");

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("ComprobantePagoConsultar", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add("@Id_Servicio", SqlDbType.BigInt).Value = dto.Id_Servicio;

                    await cn.OpenAsync().ConfigureAwait(false);

                    using (var da = new SqlDataAdapter(cmd))
                    {
                        var ds = new DataSet();
                        da.Fill(ds);

                        if (ds.Tables.Count == 0)
                            return Ok(new object[0]);

                        var dt = ds.Tables[0];

                        if (dt.Rows.Count == 0)
                            return Ok(new object[0]);

                        return Ok(dt);
                    }
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception($"Error al consultar comprobante de pago: {ex.Message}"));
            }
        }

        [Authorize]
        [ApiKey]
        [HttpPost, Route("comprobante/imagenes/consultar")]
        public async Task<IHttpActionResult> ConsultarImagenesComprobante([FromBody] ComprobantePagoImagenesConsultarRequest dto)
        {
            if (dto == null || dto.Id_ComprobantePago <= 0)
                return BadRequest("Id de comprobante requerido");

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("ComprobantePagoImagenesConsultar", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add("@Id_ComprobantePago", SqlDbType.BigInt).Value = dto.Id_ComprobantePago;

                    await cn.OpenAsync().ConfigureAwait(false);

                    using (var da = new SqlDataAdapter(cmd))
                    {
                        var ds = new DataSet();
                        da.Fill(ds);

                        if (ds.Tables.Count == 0)
                            return Ok(new object[0]);

                        return Ok(ds.Tables[0]);
                    }
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception($"Error al consultar imágenes del comprobante: {ex.Message}"));
            }
        }

        [Authorize]
        [ApiKey]
        [HttpPost, Route("comprobante/confirmar")]
        public async Task<IHttpActionResult> ConfirmarComprobantePago([FromBody] ComprobantePagoConfirmarRequest dto)
        {
            if (dto == null || dto.Id_Servicio <= 0)
                return BadRequest("Id de servicio requerido");

            if (dto.Id_Usuario <= 0)
                return BadRequest("Id de usuario requerido");

            bool exito = false;

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("ComprobantePagoConfirmar", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.Add("@Id_Servicio", SqlDbType.BigInt).Value = dto.Id_Servicio;
                    cmd.Parameters.Add("@Id_Usuario", SqlDbType.BigInt).Value = dto.Id_Usuario;

                    var pExito = cmd.Parameters.Add("@Exito", SqlDbType.Bit);
                    pExito.Direction = ParameterDirection.Output;

                    await cn.OpenAsync().ConfigureAwait(false);
                    await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);

                    exito = (pExito.Value != DBNull.Value) && (bool)pExito.Value;
                }

                if (!exito)
                    return BadRequest("No se pudo confirmar el comprobante de pago.");

                return Ok(new { Exito = exito });
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception($"Error al confirmar comprobante de pago: {ex.Message}", ex));
            }
        }

        [Authorize]
        [ApiKey]
        [HttpPost, Route("historial/consultar")]
        public async Task<IHttpActionResult> ConsultarHistorialServicio([FromBody] ServicioHistorialConsultarRequest dto)
        {
            if (dto == null || dto.Id_Servicio <= 0)
                return BadRequest("Id de servicio requerido");

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("ServicioHistorialConsultar", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add("@Id_Servicio", SqlDbType.BigInt).Value = dto.Id_Servicio;

                    await cn.OpenAsync().ConfigureAwait(false);

                    using (var da = new SqlDataAdapter(cmd))
                    {
                        var ds = new DataSet();
                        da.Fill(ds);

                        if (ds.Tables.Count == 0)
                            return Ok(new object[0]);

                        var dt = ds.Tables[0];

                        if (dt.Rows.Count == 0)
                            return Ok(new object[0]);

                        return Ok(dt);
                    }
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception($"Error al consultar historial del servicio: {ex.Message}"));
            }
        }

        [Authorize]
        [ApiKey]
        [HttpPost, Route("calificacion/insertar")]
        public async Task<IHttpActionResult> InsertarCalificacionServicio([FromBody] CalificacionServicioInsertarRequest dto)
        {
            if (dto == null)
                return BadRequest("Datos de calificación requeridos");

            if (dto.Id_Servicio <= 0)
                return BadRequest("Id de servicio inválido");

            if (dto.Id_Usuario <= 0)
                return BadRequest("Id de usuario inválido");

            if (dto.CAL_Puntuacion < 1 || dto.CAL_Puntuacion > 5)
                return BadRequest("La puntuación debe estar entre 1 y 5");

            try
            {
                bool exito = false;

                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("CalificacionServicioInsertar", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.Add("@Id_Servicio", SqlDbType.BigInt).Value = dto.Id_Servicio;
                    cmd.Parameters.Add("@Id_Usuario", SqlDbType.BigInt).Value = dto.Id_Usuario;
                    
                    var pPuntuacion = cmd.Parameters.Add("@CAL_Puntuacion", SqlDbType.Decimal);
                    pPuntuacion.Precision = 18;
                    pPuntuacion.Scale = 0;
                    pPuntuacion.Value = dto.CAL_Puntuacion;

                    if (string.IsNullOrEmpty(dto.CAL_Comentario))
                        cmd.Parameters.Add("@CAL_Comentario", SqlDbType.VarChar, 250).Value = DBNull.Value;
                    else
                        cmd.Parameters.Add("@CAL_Comentario", SqlDbType.VarChar, 250).Value = dto.CAL_Comentario;

                    var pExito = cmd.Parameters.Add("@Exito", SqlDbType.Bit);
                    pExito.Direction = ParameterDirection.Output;

                    await cn.OpenAsync().ConfigureAwait(false);
                    await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);

                    exito = (pExito.Value != DBNull.Value) && (bool)pExito.Value;
                }

                if (!exito)
                    return BadRequest("No se pudo insertar la calificación. Verifique que el servicio esté completado y que no haya calificado antes.");

                return Ok(new { exito = true });
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception($"Error al insertar calificación: {ex.Message}", ex));
            }
        }

        [Authorize]
        [ApiKey]
        [HttpPost, Route("calificacion/consultar")]
        public async Task<IHttpActionResult> ConsultarCalificacionServicio([FromBody] CalificacionServicioConsultarRequest dto)
        {
            if (dto == null || dto.Id_Servicio <= 0)
                return BadRequest("Id de servicio requerido");

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("CalificacionServicioConsultar", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add("@Id_Servicio", SqlDbType.BigInt).Value = dto.Id_Servicio;

                    if (dto.Id_Usuario.HasValue && dto.Id_Usuario.Value > 0)
                        cmd.Parameters.Add("@Id_Usuario", SqlDbType.BigInt).Value = dto.Id_Usuario.Value;
                    else
                        cmd.Parameters.Add("@Id_Usuario", SqlDbType.BigInt).Value = DBNull.Value;

                    await cn.OpenAsync().ConfigureAwait(false);

                    using (var da = new SqlDataAdapter(cmd))
                    {
                        var ds = new DataSet();
                        da.Fill(ds);

                        if (ds.Tables.Count == 0)
                            return Ok(new { calificaciones = new object[0], yaCalifico = false, idUsuarioACalificar = (long?)null });

                        var dtCalificaciones = ds.Tables[0];
                        var calificaciones = dtCalificaciones.Rows.Count > 0 ? dtCalificaciones : null;

                        bool yaCalifico = false;
                        long? idUsuarioACalificar = null;

                        if (ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                        {
                            var dtInfo = ds.Tables[1];
                            if (dtInfo.Rows[0]["YaCalifico"] != DBNull.Value)
                                yaCalifico = Convert.ToBoolean(dtInfo.Rows[0]["YaCalifico"]);
                            
                            if (dtInfo.Rows[0]["Id_UsuarioACalificar"] != DBNull.Value)
                                idUsuarioACalificar = Convert.ToInt64(dtInfo.Rows[0]["Id_UsuarioACalificar"]);
                        }

                        return Ok(new
                        {
                            calificaciones = calificaciones,
                            yaCalifico = yaCalifico,
                            idUsuarioACalificar = idUsuarioACalificar
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception($"Error al consultar calificación: {ex.Message}"));
            }
        }

    }
}