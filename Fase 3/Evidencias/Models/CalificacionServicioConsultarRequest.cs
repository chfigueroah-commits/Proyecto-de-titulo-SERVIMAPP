using System;

namespace ServiMapp.API.Models
{
    public class CalificacionServicioConsultarRequest
    {
        public long Id_Servicio { get; set; }
        public long? Id_Usuario { get; set; }
    }
}

