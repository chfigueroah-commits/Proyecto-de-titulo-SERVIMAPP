using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Web.Http;
using ServiMapp.API.Models;
using ServiMapp.API.Security;

namespace ServiMapp.API.Controllers
{
    [RoutePrefix("consulta")]
    public class EstadosController : ApiController
    {
        private readonly string _cn = ConfigurationManager
            .ConnectionStrings["SqlServer"].ConnectionString;

        [Authorize]
        [ApiKey]
        [HttpPost, Route("ofertaestados")]
        public async Task<IHttpActionResult> OfertaEstados()
        {
            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("ConsultaOfertaEstados", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

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
                return InternalServerError(ex);
            }
        }

        [Authorize]
        [ApiKey]
        [HttpPost, Route("solicitudestados")]
        public async Task<IHttpActionResult> SolicitudEstados()
        {
            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("ConsultaSolicitudEstados", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

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
                return InternalServerError(ex);
            }
        }

        [Authorize]
        [ApiKey]
        [HttpPost, Route("servicioestados")]
        public async Task<IHttpActionResult> ServicioEstados()
        {
            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("ConsultaServicioEstados", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

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
                return InternalServerError(ex);
            }
        }
    }
}
