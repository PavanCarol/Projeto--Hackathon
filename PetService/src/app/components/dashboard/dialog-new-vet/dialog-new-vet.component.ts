import { Component } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-dialog-new-vet',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './dialog-new-vet.component.html',
  styleUrl: './dialog-new-vet.component.scss',
})
export class DialogNewVetComponent {
  name = new FormControl('', [Validators.required]);
  sobrenome = new FormControl('', [Validators.required]);
  date = new FormControl('', [Validators.required]);
  tempoAtuacao = new FormControl('', [Validators.required]);
  faculdade = new FormControl('', [Validators.required]);
  posGratuacao = new FormControl('');

  // constructor(private imageService: ImageService){}
  // processFile(imageInput: any) {
  //   const file: File = imageInput.files[0];
  //   const reader = new FileReader();

  //   reader.addEventListener('load', (event: any) => {

  //     this.selectedFile = new ImageSnippet(event.target.result, file);

  //     this.imageService.uploadImage(this.selectedFile.file).subscribe(
  //       (res) => {

  //       },
  //       (err) => {

  //       })
  //   });

  //   reader.readAsDataURL(file);
  // }
}
