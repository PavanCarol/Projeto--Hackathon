import { Component } from '@angular/core';
import { OpenaiService } from '../../../openai.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mensagem',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mensagem.component.html',
  styleUrls: ['./mensagem.component.scss'], // Corrigido o nome do campo
})
export class MensagemComponent {
  chatResponses: { userMessage: string; reply: string }[] = [];

  constructor(private openaiService: OpenaiService) {}

  sendMessage() {
    const messageInputElement = document.getElementById(
      'message-input'
    ) as HTMLInputElement;
    const userMessage = messageInputElement.value;
    if (!messageInputElement.value) {
      messageInputElement.style.border = '1px solid red';
      return;
    }
    messageInputElement.style.border = 'none';

    const statusElement = document.getElementById('status') as HTMLElement;
    statusElement.innerHTML = 'Carregando...';

    const messages = [
      { role: 'system', content: 'Você é um assistente útil.' },
      { role: 'user', content: userMessage },
    ];

    this.openaiService.getChatResponse(messages).subscribe(
      (response) => {
        console.log(response);
        const reply = response.choices[0].message.content;
        this.chatResponses.push({ userMessage, reply });
        messageInputElement.value = ''; // Limpa o input no DOM
        statusElement.innerHTML = ''; // Limpa o status após carregar
      },
      (error) => {
        console.error('Erro ao obter resposta do ChatGPT', error);
        statusElement.innerHTML = 'Erro ao obter resposta do ChatGPT';
      }
    );
  }
}
