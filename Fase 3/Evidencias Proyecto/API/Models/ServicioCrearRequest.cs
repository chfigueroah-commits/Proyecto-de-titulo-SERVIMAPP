using System;

namespace ServiMapp.API.Models
{
    public class ServicioCrearRequest
    {
        public long Id_SolicitudServicio { get; set; }
        public long Id_Oferta { get; set; }
        public long Id_Usuario { get; set; }
        public DateTime SE_FechaModifica { get; set; }
    }
}

