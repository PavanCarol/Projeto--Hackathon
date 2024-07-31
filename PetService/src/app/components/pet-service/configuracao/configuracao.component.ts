import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpRequestService } from '../../../services/http-request.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configuracao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './configuracao.component.html',
  styleUrl: './configuracao.component.scss',
})
export class ConfiguracaoComponent implements OnInit{
  
  constructor(private httpService: HttpRequestService) {}

  ngOnInit(): void {
    this.configurarBot();
  }

  configurarBot(): void {
    const horarioAbertura = '08:00';
    const horarioFechamento = '18:30';
    
    const config = {
      nomeBot: 'MeuBot',
      horarioAbertura,
      horarioFechamento,
      perguntasFrequentes: [
        { titulo: 'Qual é o horário de funcionamento?', pergunta: `Nosso horário de funcionamento é das ${horarioAbertura} às ${horarioFechamento}.` },
        { titulo: 'Como faço para entrar em contato?', pergunta: 'Pelo numero' },
        {titulo:'Aceitam quais raças?', resposta:' Aceitamos todas as raças, medio porte, grande porte e pegueno porte'},
      ]
    };

    this.httpService.configurarBot(config).subscribe(
      (response) => {
        if (response.sucesso) {
          console.log('Configuração salva com sucesso');
        } else {
          console.log(response.mensagem);
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }
}