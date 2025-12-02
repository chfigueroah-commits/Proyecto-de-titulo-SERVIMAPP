using System;

namespace ServiMapp.API.Models
{
    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public long IdUsuario { get; set; }
    }
}

