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
    [RoutePrefix("oferta")]
    public class OfertaController : ApiController
    {
        private readonly string _cn = ConfigurationManager
            .ConnectionStrings["SqlServer"].ConnectionString;

        [Authorize]
        [ApiKey]
        [HttpPost, Route("crear")]
        public async Task<IHttpActionResult> CrearOferta([FromBody] OfertaCrearRequest dto)
        {
            if (dto == null)
                return BadRequest("Parametros vacios");

            bool exito = false;

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("OfertaCrear", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.Add("@Id_SolicitudServicio", SqlDbType.BigInt).Value = dto.Id_SolicitudServicio;
                    cmd.Parameters.Add("@Id_Usuario", SqlDbType.BigInt).Value = dto.Id_Usuario;

                    var pMonto = cmd.Parameters.Add("@OF_Monto", SqlDbType.Decimal);
                    pMonto.Precision = 18;
                    pMonto.Scale = 0;
                    pMonto.Value = dto.Monto;

                    var pComentario = cmd.Parameters.Add("@OF_Comentario", SqlDbType.Text).Value = dto.Comentario;

                    var pExito = cmd.Parameters.Add("@Exito", SqlDbType.Bit);
                    pExito.Direction = ParameterDirection.Output;

                    await cn.OpenAsync().ConfigureAwait(false);
                    await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);

                    exito = (pExito.Value != DBNull.Value) && (bool)pExito.Value;
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }

            return Ok(new { exito });
        }

        [Authorize]
        [ApiKey]
        [HttpPost, Route("consulta")]
        public async Task<IHttpActionResult> ConsultarOfertas([FromBody] OfertaConsultarRequest dto)
        {
            if (dto == null || dto.Id_Usuario <= 0)
                return BadRequest("Id de usuario requerido");

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("ConsultaOferta", cn))
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
                return InternalServerError(new Exception($"Error al consultar oferta: {ex.Message}"));
            }
        }

        [Authorize]
        [ApiKey]
        [HttpPost, Route("ofertasolicitud")]
        public async Task<IHttpActionResult> ConsultarOfertasSolicitud([FromBody] OfertaCrearRequest dto)
        {
            if (dto == null || dto.Id_SolicitudServicio <= 0)
                return BadRequest("Id de solicitud requerido");

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("ConsultaOfertaSolicitud", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    // Parámetro de entrada
                    cmd.Parameters.Add("@Id_SolicitudServicio", SqlDbType.BigInt).Value = dto.Id_SolicitudServicio;

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
                return InternalServerError(new Exception($"Error al consultar oferta solicitud: {ex.Message}"));
            }
        }

        [Authorize]
        [ApiKey]
        [HttpPost, Route("eliminar")]
        public async Task<IHttpActionResult> EliminarOferta([FromBody] OfertaEliminarRequest dto)
        {
            if (dto == null || dto.Id_Oferta <= 0)
                return BadRequest("No se encontro la oferta.");

            bool exito;

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("OfertaCancelar", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    // Parámetro de entrada
                    cmd.Parameters.Add("@Id_Oferta", SqlDbType.BigInt).Value = dto.Id_Oferta;

                    // Parámetro de salida
                    var pExito = cmd.Parameters.Add("@Exito", SqlDbType.Bit);
                    pExito.Direction = ParameterDirection.Output;

                    await cn.OpenAsync().ConfigureAwait(false);
                    await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);

                    exito = (pExito.Value != DBNull.Value) && (bool)pExito.Value;
                }
                
                if (!exito)
                {
                    return BadRequest("No se pudo cancelar la oferta.");
                }

                // Éxito
                return Ok(new { Exito = exito });
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception($"Error al cancelar oferta: {ex.Message}", ex));
            }
        }

        [Authorize]
        [ApiKey]
        [HttpPost, Route("rechazar")]
        public async Task<IHttpActionResult> Rechaza([FromBody] OfertaRechazarRequest dto)
        {
            if (dto == null || dto.Id_Oferta <= 0)
                return BadRequest("No se encontro la oferta.");

            bool exito;

            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("OfertaRechazar", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    // Parámetro de entrada
                    cmd.Parameters.Add("@Id_Oferta", SqlDbType.BigInt).Value = dto.Id_Oferta;

                    // Parámetro de salida
                    var pExito = cmd.Parameters.Add("@Exito", SqlDbType.Bit);
                    pExito.Direction = ParameterDirection.Output;

                    await cn.OpenAsync().ConfigureAwait(false);
                    await cmd.ExecuteNonQueryAsync().ConfigureAwait(false);

                    exito = (pExito.Value != DBNull.Value) && (bool)pExito.Value;
                }

                if (!exito)
                {
                    return BadRequest("No se pudo rechazar la oferta.");
                }

                // Éxito
                return Ok(new { Exito = exito });
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception($"Error al rechazar oferta: {ex.Message}", ex));
            }
        }
    }
}
