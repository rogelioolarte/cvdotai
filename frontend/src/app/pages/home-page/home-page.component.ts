import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ProcessPdfService } from '../../services/process-pdf.service';
import { Subscription } from 'rxjs';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

interface ComplexParagrah {
  title: string;
  subText: SimpleParagrah[]
}

interface SimpleParagrah {
  title: string;
  lineText: string;
}

interface ParsedData {
  title: string;
  complexParagraphs: ComplexParagrah[];
  simpleParagraphs: SimpleParagrah[];
  annotations: string[];
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public filecv?: File;
  public recommendations: ParsedData = {
    title: '',
    complexParagraphs: [],
    simpleParagraphs: [],
    annotations: []
  };
  public responseText: string = '';
  private processPdf = inject(ProcessPdfService);
  private subscription: Subscription = new Subscription();
  private _snackBar = inject(MatSnackBar);
  private horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  private verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  openSnackBar(text: string, closeText: string) {
    this._snackBar.open(text, closeText, {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      jobDescription: ['', [Validators.required, Validators.minLength(100), Validators.maxLength(2000)]],
      filename: ['', [Validators.required, Validators.pattern(/.+\.pdf$/)]],
    });
  }

  ngOnInit(): void {
    this.subscription.add(this.processPdf.sendGet().subscribe({
      next: (response) => {
        if (response.status == 200) {
          console.log('backend good');
          this.openSnackBar('The API is online, you can continue...', 'Close')
        }
      },
      error: (error) => {
        console.error('Error al conectar con el backend:', error)
        this.openSnackBar('The API is offline, Chech the repository for more info...', 'Close')
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleSubmit() {
    if (this.form.valid && this.filecv) {
      const jobDescription = this.form.get('jobDescription')?.value;
      this.subscription.add(this.processPdf.sendPDFandDescription(this.filecv, jobDescription).subscribe({
        next: (response) => {
          this.responseText = response.response_text;
          this.extractInformationFromText();
        },
        error: (error) => {
          console.error('Error al enviar el archivo:', error)
          this.openSnackBar(error.error, 'Close')
        }
      }));
    }
  }

  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.filecv = input.files[0];
      this.form.patchValue({ filename: this.filecv.name });
    }
  }

  triggerFileUpload() {
    document.getElementById('cv-upload')?.click();
  }

  get jobDescription() {
    return this.form.get('jobDescription');
  }


  extractInformationFromText() {
    let stateParagrah: number = 0;
    const initialComplexParagrah: ComplexParagrah = { title: "", subText: [] };
    const initialSimpleParagrah: SimpleParagrah = { title: "", lineText: "" };
    let actualComplexParagrah = initialComplexParagrah;
    let actualSimpleParagrah = initialSimpleParagrah;

    this.responseText.trim().split('\n').forEach((line) => {
      if (line.startsWith('## ')) {
        this.recommendations.title = line.replace('## ', '').trim();
      } else if (line.startsWith('**') && line.endsWith('**')) {
        if (stateParagrah >= 1) {
          if (actualComplexParagrah.subText.length > 0) {
            this.recommendations.complexParagraphs.push({ ...actualComplexParagrah });
          } else if (actualSimpleParagrah.lineText.length > 0) {
            this.recommendations.simpleParagraphs.push({ ...actualSimpleParagrah });
          }
          console.log('actual-complex:', actualComplexParagrah )
          console.log('actual-simple:', actualSimpleParagrah )
          stateParagrah = 0;
          actualComplexParagrah = initialComplexParagrah;
          actualSimpleParagrah = initialSimpleParagrah;
        }
        if (stateParagrah === 0) {
          stateParagrah += 1;
          actualComplexParagrah.title = line.replace(/\*\*/g, '')
            .replace(/g:\*\*/, '').replace(':', '').trim();
          actualSimpleParagrah.title = actualComplexParagrah.title;
        }
      } else if (line.startsWith('* **') && stateParagrah >= 1) {
        stateParagrah += 1;
        let temp_line = line.split('**');
        actualComplexParagrah.subText.push({
          title: temp_line[1].replace(/:$/, '').trim(),
          lineText: temp_line[2].trim()
        });
      } else if (!line.startsWith('* **') && stateParagrah === 1 && line !== '') {
        actualComplexParagrah.subText = [];
        actualSimpleParagrah.lineText += line + ' ';
      } else if (!line.startsWith('* **') && stateParagrah === 0 && line !== '') {
        this.recommendations.annotations.push(line.trim());
      }
    })
    if (actualComplexParagrah.subText.length > 0) {
      this.recommendations.complexParagraphs.push({ ...actualComplexParagrah });
    } else if (actualSimpleParagrah.lineText.length > 0) {
      this.recommendations.simpleParagraphs.push({ ...actualSimpleParagrah });
    }
    console.log('actual-complex:', actualComplexParagrah )
    console.log('actual-simple:', actualSimpleParagrah )
  }

}
