import { TestBed } from '@angular/core/testing';

import { ProcessPdfService } from './process-pdf.service';

describe('ProcessPdfService', () => {
  let service: ProcessPdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessPdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
