import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators, FormArray, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MasterService } from "../../service/backendApi.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-createinvoice",
  templateUrl: "./createinvoice.component.html",
  styleUrls: ["./createinvoice.component.css"],
})
export class CreateinvoiceComponent implements OnInit {
  constructor(
    private builder: FormBuilder,
    private service: MasterService,
    private router: Router,
    private alert: ToastrService,
    private activeroute: ActivatedRoute
  ) {
    this.alert.toastrConfig.positionClass = "toast-top-center";
  }
  pagetitle = "Create Invoice";
  invoicedetail!: FormArray<any>;
  invoiceproduct!: FormGroup<any>;

  mastercustomer: any;
  masterproduct: any;
  editinvoiceno: any;
  isedit = false;
  editinvdetail: any;

  ngOnInit(): void {
    this.GetProducts();

    this.editinvoiceno = this.activeroute.snapshot.paramMap.get("invoiceno");
    if (this.editinvoiceno != null) {
      this.pagetitle = "Edit Invoice";
      this.isedit = true;
      this.SetEditInfo(this.editinvoiceno);
    }
  }

  invoiceform = this.builder.group({
    invoiceNo: this.builder.control(""),
    customerName: this.builder.control(""),
    contactNumber: this.builder.control(""),
    percentageControl: this.builder.control({ value: 0, disabled: false }),
    total: this.builder.control({ value: 0, disabled: true }),
    discount: this.builder.control({ value: 0, disabled: true }),
    netTotal: this.builder.control({ value: 0, disabled: true }),
    details: this.builder.array([]),
  });

  SetEditInfo(invoiceno: any) {
    this.service.GetInvDetailbycode(invoiceno).subscribe((res) => {
      this.editinvdetail = res;
      for (let i = 0; i < this.editinvdetail.length; i++) {
        this.addnewproduct();
      }
    });

    this.service.GetInvHeaderbycode(invoiceno).subscribe((res) => {
      let editdata: any;
      editdata = res;
      if (editdata != null) {
        this.invoiceform.setValue({
          invoiceNo: editdata.invoiceNo,
          customerName: editdata.customerName,
          contactNumber: editdata.contactNumber,
          total: editdata.total,
          discount: editdata.discount,
          netTotal: editdata.netTotal,
          percentageControl: editdata.percentageControl,
          details: this.editinvdetail,
        });
      }
    });
  }

  SaveInvoice() {
    let customercode = this.invoiceform.get("customerName")?.value;
    let contactNumber = this.invoiceform.get("contactNumber")?.value;
    if (this.invoiceform.valid && customercode && contactNumber) {
      this.service
        .SaveInvoice(this.invoiceform.getRawValue())
        .subscribe((res) => {
          let result: any;
          result = res;
          if (result.id) {
            if (this.isedit) {
              this.alert.success(
                "Updated Successfully.",
                "Invoice :" + result.id
              );
            } else {
              this.alert.success(
                "Created Successfully.",
                "Invoice :" + result.id
              );
            }
            this.router.navigate(["/"]);
          } else {
            this.alert.error("Failed to save.", "Invoice");
          }
        });
    } else {
      this.alert.warning(
        "Please enter values in all mandatory filed",
        "Validation"
      );
    }
  }

  addnewproduct() {
    this.invoicedetail = this.invoiceform.get("details") as FormArray;

    // let customercode = this.invoiceform.get("customerName")?.value;
    // if ((customercode != null && customercode != "") || this.isedit) {
    this.invoicedetail.push(this.Generaterow());
    // } else {
    // this.alert.warning("Please enter cutomer name", "Validation");
    // }
  }

  get invproducts() {
    return this.invoiceform.get("details") as FormArray;
  }

  Generaterow() {
    return this.builder.group({
      invoiceNo: this.builder.control(""),
      productCode: this.builder.control("", Validators.required),
      productName: this.builder.control(""),
      description: this.builder.control(""),
      qty: this.builder.control(1),
      salesPrice: this.builder.control(0),
      total: this.builder.control({ value: 0, disabled: true }),
    });
  }

  GetProducts() {
    this.service.GetProducts().subscribe((res) => {
      this.masterproduct = res;
    });
  }

  productchange(event: any, index: any) {
    let selectedProduct = event.target.value;
    this.invoicedetail = this.invoiceform.get("details") as FormArray;
    this.invoiceproduct = this.invoicedetail.at(index) as FormGroup;
    if (selectedProduct) {
      this.service.GetProductbyId(selectedProduct).subscribe((res) => {
        let proddata: any;
        proddata = res;
        if (proddata != null) {
          this.invoiceproduct
            .get("productName")
            ?.setValue(proddata.productName);
          this.invoiceproduct
            .get("description")
            ?.setValue(proddata.description);
          this.invoiceproduct.get("salesPrice")?.setValue(proddata.price);
          this.Itemcalculation(index);
        }
      });
    }
  }

  Itemcalculation(index: any) {
    this.invoicedetail = this.invoiceform.get("details") as FormArray;
    this.invoiceproduct = this.invoicedetail.at(index) as FormGroup;
    let qty = this.invoiceproduct.get("qty")?.value;
    let price = this.invoiceproduct.get("salesPrice")?.value;
    let total = qty * price;
    this.invoiceproduct.get("total")?.setValue(total);

    this.summarycalculation();
  }
  Removeproduct(index: any) {
    if (confirm("Do you want to remove?")) {
      this.invproducts.removeAt(index);
      this.summarycalculation();
    }
  }

  summarycalculation() {
    let array = this.invoiceform.getRawValue().details;
    let sumtotal = 0;

    array.forEach((x: any) => {
      sumtotal = sumtotal + x.total;
    });

    let percentageControl =
      this.invoiceform.get("percentageControl")?.value ?? 0;

    // Discount calculation
    let discount = (percentageControl / 100) * sumtotal;
    let nettotal = sumtotal - discount;

    this.invoiceform.get("total")?.setValue(sumtotal);
    this.invoiceform.get("discount")?.setValue(discount);
    this.invoiceform.get("netTotal")?.setValue(nettotal);
  }
}
