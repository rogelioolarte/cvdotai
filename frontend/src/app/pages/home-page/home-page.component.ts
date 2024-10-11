import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { ProcessPdfService } from '../../services/process-pdf.service';
import { Subscription } from 'rxjs';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { MatExpansionModule } from '@angular/material/expansion';

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
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatExpansionModule,
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
    simpleParagraphs: []
  };
  public responseText: string = '';
  private processPdf = inject(ProcessPdfService);
  private subscription: Subscription = new Subscription();
  private _snackBar = inject(MatSnackBar);
  private horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  private verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  readonly panelOpenState = signal(false);
  public iconStyle: string = "";

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      jobDescription: ['', [Validators.required, Validators.minLength(100), Validators.maxLength(3000)]],
      filename: ['', [Validators.required, Validators.pattern(/.+\.pdf$/)]],
    });
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);
    iconRegistry.addSvgIcon('upload', sanitizer.bypassSecurityTrustResourceUrl('upload.svg'));
    iconRegistry.addSvgIcon('check-circle', sanitizer.bypassSecurityTrustResourceUrl('check_circle.svg'));
    iconRegistry.addSvgIcon('send', sanitizer.bypassSecurityTrustResourceUrl('send.svg'));
  }

  ngOnInit(): void {
    this.subscription.add(this.processPdf.sendGet().subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.openSnackBar('✅ API Online, you can continue...', 'Close', 3000)
        }
      },
      error: (error) => {
        this.openSnackBar('⛔ API Offline, Chech the repository for more info...', 'Close', 3000)
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  openSnackBar(text: string, closeText: string, duration?: number) {
    this._snackBar.open(text, closeText, {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: duration
    });
  }

  handleSubmit() {
    if (this.form.valid && this.filecv) {
      this.openSnackBar('Processing...', 'Close');
      const jobDescription = this.form.get('jobDescription')?.value;
      this.subscription.add(this.processPdf.sendPDFandDescription(this.filecv, jobDescription).subscribe({
        next: (response) => {
          this.responseText = response.response_text;
          this.extractInformationFromText();
        },
        error: (error) => {
          if (error.status === 400) {
            if (error.error.error) {
              this.openSnackBar(`❌ ${error.error.error}`, 'Close');
            } else {
              this.openSnackBar('Invalid request. Please check the inputs.', 'Close');
            }
          } else if (error.status === 500) {
            this.openSnackBar(`❌ ${error.error.error}`, 'Close');
          } else {
            this.openSnackBar('An unexpected error occurred. Please try again.', 'Close');
          }
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
    let actualComplexParagrah: ComplexParagrah = { title: "", subText: [] };
    let actualSimpleParagrah: SimpleParagrah = { title: "", lineText: "" };
    let array_length = 0;

    this.responseText.trim().split('\n').forEach((line, index, array) => {
      if(line.startsWith('## ')) {
        this.recommendations.title = line.replace('## ', '').trim();
        array_length = array.length;
      } else if(line.startsWith('**') && this.recommendations.title.length > 0 ) {
        if (actualComplexParagrah.subText.length > 0) {
          this.recommendations.complexParagraphs.push({ ...actualComplexParagrah });
          actualComplexParagrah = { title: "", subText: [] };
        } else if (actualSimpleParagrah.lineText.length > 0) {
          this.recommendations.simpleParagraphs.push({ ...actualSimpleParagrah });
          actualSimpleParagrah = { title: "", lineText: "" };
        }
        actualComplexParagrah.title = line.replace(/\*\*/g, '')
            .replace(/g\*\*/, '').replace(':', '').trim();
        actualSimpleParagrah.title = actualComplexParagrah.title;
        stateParagrah = stateParagrah + 1;
      } else if(line.startsWith('* **') && actualComplexParagrah.title.length > 0) {
        let temp_line = line.split('**');
        actualComplexParagrah.subText.push({
          title: temp_line[1].replace(/:$/, '').trim(),
          lineText: temp_line[2].trim()
        });
      } else if(!line.startsWith('* **') && !line.startsWith('**') &&line !== '' &&
          actualSimpleParagrah.title.length > 0 ) {
        actualSimpleParagrah.lineText += line + ' ';
      }
      if(index+1 === array_length){
        if (actualComplexParagrah.subText.length > 0) {
          this.recommendations.complexParagraphs.push({ ...actualComplexParagrah });
          actualComplexParagrah = { title: "", subText: [] };
        } else if (actualSimpleParagrah.lineText.length > 0) {
          this.recommendations.simpleParagraphs.push({ ...actualSimpleParagrah });
          actualSimpleParagrah = { title: "", lineText: "" };
        }
      }
    })
  }

}
