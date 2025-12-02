using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ServiMapp.API.Models
{
    public class ServicioCancelarRequest
    {
        public long Id_Servicio { get; set; }
        public long Id_Usuario { get; set; }
        public string SE_Comentario { get; set; }
    }
}