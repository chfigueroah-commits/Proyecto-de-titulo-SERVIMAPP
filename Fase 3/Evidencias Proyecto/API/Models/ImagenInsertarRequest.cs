using System;

namespace ServiMapp.API.Models
{
    public class ImagenInsertarRequest
    {
        public string IMG_Archivo { get; set; }
        public string IMG_Base64 { get; set; }
        public long Id_Usuario { get; set; }
        public long? Id_SolicitudServicio { get; set; }
        public long? Id_Servicio { get; set; }
    }
}

