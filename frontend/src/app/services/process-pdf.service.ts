import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProcessPdfService {
  public apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  sendPDFAndDescription(file: File, jobDescription: string): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('resume_pdf', file, file.name);
    formData.append('job_description', jobDescription);

    const headers = new HttpHeaders({
      'Accept': 'application/json',
    });
    return this.http.post<any>(this.apiUrl.concat('/process/'),
      formData, { headers, withCredentials: true });
  }

  sendGet(): Observable<any> {
    return this.http.get(this.apiUrl, { observe: 'response', responseType: 'text' })
  }

}
