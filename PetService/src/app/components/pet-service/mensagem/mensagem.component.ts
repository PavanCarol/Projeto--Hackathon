import { Component } from '@angular/core';
import { OpenaiService } from '../../../openai.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpRequestService } from '../../../services/http-request.service';

@Component({
  selector: 'app-mensagem',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './mensagem.component.html',
  styleUrls: ['./mensagem.component.scss'], // Corrigido o nome do campo
})
export class MensagemComponent {
  chatResponses: { userMessage: string; reply: string }[] = [];

  constructor(private http:HttpRequestService) {
  }

  sendMessage() {
    const messageInputElement = document.getElementById('message-input') as HTMLInputElement;
    const userMessage = messageInputElement.value;
    if (!userMessage) {
      messageInputElement.style.border = '1px solid red';
      return;
    }
    messageInputElement.style.border = 'none';

    const statusElement = document.getElementById('status') as HTMLElement;
    statusElement.innerHTML = 'Carregando...';

    this.http.bot(userMessage).subscribe((res) => {
      if (res.erro) {
        statusElement.innerHTML = 'Erro ao enviar mensagem.';
      } else {
        this.chatResponses.push({ userMessage, reply: res.resposta });
        messageInputElement.value = ''; // Limpar o campo de entrada após enviar a mensagem
        statusElement.innerHTML = '';
      }
    }, () => {
      statusElement.innerHTML = 'Erro ao enviar mensagem.';
    });
  }
}