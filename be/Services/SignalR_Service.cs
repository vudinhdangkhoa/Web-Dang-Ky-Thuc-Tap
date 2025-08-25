using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace be.Services
{
    [Authorize]
    public class SignalR_Service : Hub
    {
        public async Task SendMessage(string user, string message)
        {
            await Clients.User(user).SendAsync("ReceiveMessage", message);
        }

    }
}