using System;

namespace ServiMapp.API.Models
{
    public class UsuarioActualizarRequest
    {
        public long Id_Usuario { get; set; }
        public string US_Biografia { get; set; }
        public string US_Telefono { get; set; }
        public long? Id_Profesion { get; set; }
    }
}

