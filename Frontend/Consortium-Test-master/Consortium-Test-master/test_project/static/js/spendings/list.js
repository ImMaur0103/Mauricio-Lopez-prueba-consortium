const app = Vue.createApp({
  delimiters: ["{", "}"],
  data() {
    return {
      uploadDocumentName: 'liquidation_sent',
      uploadDocumentLabel: 'Subir documento',
      apiUrl: '/api',
      loadingUpload: false,
      spendingId: 0,
      documentUploaded: false,
      documentWarningText: '',
      justificationText: '',
      justification: '',
      needJustification: false,
      badRequest: false,
    };
  },
  mounted() {
    this.setFilterValues();
  },
  methods: {
    setFilterValues() {
      let paramString = location.href.split("?")[1];
      let queryString = new URLSearchParams(paramString);

      let $change_page_links = document.querySelectorAll(".link_change_page");
      let dataForPagination = "";

      for (let item of queryString.entries()) {
        let key = item[0];
        let value = item[1];

        if (value != "" && key != 'page') {
          dataForPagination += `&${key}=${value}`;
        }
      }

      $change_page_links.forEach(element => {
        element.href += dataForPagination;
    });
    },

    getDocumentNameToUpload(spendingId){
      this.spendingId = spendingId;
      fetch(`${this.apiUrl}/spendings/${spendingId}/`)
      .then(response => response.json())
      .then(data => {

        if (data.account_status == null) {
          this.uploadDocumentName = 'account_status';
          this.uploadDocumentLabel = 'Subir estado de cuenta';
        }
        else if (data.invoice == null && data.type == 'INVOICED') {
          this.uploadDocumentName = 'invoice';
          this.uploadDocumentLabel = 'Subir factura';
        }
        else if (data.signed_liquidation_certificate == null || data.signed_liquidation_certificate == '') {
          this.uploadDocumentName = 'signed_liquidation_certificate';
          this.uploadDocumentLabel = 'Subir constancia de liquidación';
        } 

      });
    },
    submitDocument(){
      let form = document.getElementById('form_upload_document');
      let formData = new FormData(form);
      this.loadingUpload = true;
      let token = document.querySelector('[name=csrfmiddlewaretoken]');

      fetch(`${this.apiUrl}/spendings/${this.spendingId}/`, {
        method: 'PATCH',
        body: formData,
        headers: {
          'X-CSRFToken': token.value
        }
      })
      .then(async response => {
        if (response.status == 400) {
          const data = await response.json();
          throw new Error(data.error);
        }

        else if(!response.ok) {
          throw new Error(`Server Error: ${response.status} ${response.statusText}`);
        }

        else if (response.status == 200) {
          this.needJustification = true;
        }
        return response.json();
      })
      .then(data => {
        this.documentUploaded = true;
        this.badRequest = false;
        this.documentWarningText = data?.warning ?? ''
      })
      .catch(error => {
        console.error('Error:', error);
        this.badRequest = true;
        this.documentWarningText = error;
      })
      .finally(() => {
        this.loadingUpload = false;
      });
    },
    reload() {
      location.reload();
    },
    getSpendingId(spendingId){
      this.spendingId = spendingId;
    },
    submitJustification(){
      fetch(`${this.apiUrl}/spendings/${this.spendingId}/`, {
        method: 'PATCH',
        body: JSON.stringify(
          {
            justification: document.getElementById('txt_justification').value
          }
        ),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Server Error: ${response.status} ${response.statusText}`);
        }

        alert('Justificación enviada correctamente');
        location.reload();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error al enviar la justificación');
      });
    },
    getJustification(spendingId){
      fetch(`${this.apiUrl}/spendings/${spendingId}/`)
      .then(response => response.json())
      .then(data => {
        this.justificationText = data.justification;
      });
    }
  },
});

app.mount("#spending-list");
