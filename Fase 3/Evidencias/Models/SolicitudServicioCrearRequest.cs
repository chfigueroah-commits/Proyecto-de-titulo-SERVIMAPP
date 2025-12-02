using System;
using System.Collections.Generic;

namespace ServiMapp.API.Models
{
    public class ImagenSolicitudDto
    {
        public string IMG_Archivo { get; set; }
        public string IMG_Base64 { get; set; }
    }

    public class SolicitudServicioCrearRequest
    {
        public long Id_Usuario { get; set; }
        public long Id_Categoria { get; set; }
        public long Id_Comuna { get; set; }
        public DateTime SS_FechaServicio { get; set; }
        public string SS_Titulo { get; set; }
        public string SS_Descripcion { get; set; }
        public decimal SS_Latitud { get; set; }
        public decimal SS_Longitud { get; set; }
        public long SS_Contacto { get; set; }
        public string SS_Direccion { get; set; }
        public DateTime SS_FechaExpira { get; set; }
        public List<ImagenSolicitudDto> Imagenes { get; set; }
    }
}

