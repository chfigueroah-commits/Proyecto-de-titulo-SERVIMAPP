using System.Collections.Generic;

namespace ServiMapp.API.Models
{
    public class ComprobantePagoInsertarRequest
    {
        public long Id_Servicio { get; set; }
        public long Id_Usuario { get; set; }
        public string CP_Comentario { get; set; }
        public List<ImagenComprobante> Imagenes { get; set; }
    }

    public class ImagenComprobante
    {
        public string IMG_Archivo { get; set; }
        public string IMG_Base64 { get; set; }
    }
}

