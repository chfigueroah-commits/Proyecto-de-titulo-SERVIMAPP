using System;

namespace ServiMapp.API.Models
{
    public class OfertaCrearRequest
    {
        public long Id_SolicitudServicio { get; set; }
        public long Id_Usuario { get; set; }
        public int Monto { get; set; }
        public string Comentario { get; set; }
    }
}

