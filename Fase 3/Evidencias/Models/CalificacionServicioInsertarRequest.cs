using System;

namespace ServiMapp.API.Models
{
    public class CalificacionServicioInsertarRequest
    {
        public long Id_Servicio { get; set; }
        public long Id_Usuario { get; set; }
        public decimal CAL_Puntuacion { get; set; }
        public string CAL_Comentario { get; set; }
    }
}

