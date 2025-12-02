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
    public class CategoriaController : ApiController
    {
        private readonly string _cn = ConfigurationManager
            .ConnectionStrings["SqlServer"].ConnectionString;

        [Authorize]
        [ApiKey]
        [HttpPost, Route("categoria")]
        public async Task<IHttpActionResult> Categoria()
        {
            try
            {
                using (var cn = new SqlConnection(_cn))
                using (var cmd = new SqlCommand("ConsultaCategoria", cn))
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
