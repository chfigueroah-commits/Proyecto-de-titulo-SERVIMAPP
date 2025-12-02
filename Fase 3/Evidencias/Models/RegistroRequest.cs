using System;

namespace ServiMapp.API.Models
{
    public class RegistroRequest
    {
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Rut { get; set; }
        public string Correo { get; set; }
        public string Contrasena { get; set; }
        public string Telefono { get; set; }
        public string FechaNacimiento { get; set; }
    }
}

