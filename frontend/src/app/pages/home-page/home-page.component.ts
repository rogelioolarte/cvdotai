import {Component, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
import { marked } from 'marked';

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
  public fileCv?: File;
  @ViewChild('response') public responseBody: ElementRef<HTMLDivElement> | undefined;
  private processPdf = inject(ProcessPdfService);
  private subscription: Subscription = new Subscription();
  private _snackBar = inject(MatSnackBar);
  private horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  private verticalPosition: MatSnackBarVerticalPosition = 'bottom';
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
        this.openSnackBar('⛔ API Offline, Check the repository for more info...', 'Close', 3000)
        console.log("Error while connecting API", error)
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
    if (this.form.valid && this.fileCv) {
      this.openSnackBar('Processing...', 'Close', 5000);
      const jobDescription = this.form.get('jobDescription')?.value;
      this.subscription.add(this.processPdf.sendPDFAndDescription(this.fileCv, jobDescription).subscribe({
        next: (response) => {
          this.convertMarkdownToHTML(response.response_text);
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
      this.fileCv = input.files[0];
      this.form.patchValue({ filename: this.fileCv.name });
    }
  }

  triggerFileUpload() {
    document.getElementById('cv-upload')?.click();
  }

  get jobDescription() {
    return this.form.get('jobDescription');
  }

  convertMarkdownToHTML(markdownText: string) {
    const mdBlockElement = this.responseBody?.nativeElement;
    if(mdBlockElement != undefined) {
      mdBlockElement.classList.add('markdown-body');
      try {
        mdBlockElement.innerHTML = <string>marked.parse(markdownText);
      } catch (error) {
        mdBlockElement.textContent = "Error processing Markdown content. Please contact the administrator..";
      }
    }

  }

}
