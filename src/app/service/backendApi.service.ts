import { Injectable } from "@angular/core";

import { HttpClient } from "@angular/common/http";
@Injectable({
  providedIn: "root",
})
export class MasterService {
  backendUrl: string;

  constructor(private http: HttpClient) {
    this.backendUrl = "http://localhost:5103/api";
  }

  GetProducts() {
    return this.http.get(`${this.backendUrl}/product`);
  }
  GetProductbyId(id: any) {
    return this.http.get(`${this.backendUrl}/product/id?id=${id}`);
  }

  GetAllInvoice() {
    return this.http.get(`${this.backendUrl}/invoice`);
  }

  GetInvHeaderbycode(invoiceno: any) {
    return this.http.get(
      `http://localhost:5103/Invoice/GetAllHeaderbyCode?invoiceno=` + invoiceno
    );
  }
  GetInvDetailbycode(invoiceno: any) {
    return this.http.get(
      `http://localhost:5103/Invoice/GetAllDetailbyCode?invoiceno=` + invoiceno
    );
  }
  RemoveInvoice(invoiceno: any) {
    return this.http.delete(`${this.backendUrl}/invoice?id=${invoiceno}`);
  }

  SaveInvoice(invoicedata: any) {
    return this.http.post(`${this.backendUrl}/invoice`, invoicedata);
  }

  GenerateInvoicePDF(invoiceno: any) {
    return this.http.get(`${this.backendUrl}/invoice/print?id=${invoiceno}`, {
      responseType: "blob",
    });
  }
}
