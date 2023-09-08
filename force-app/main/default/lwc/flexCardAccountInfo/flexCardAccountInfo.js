import { LightningElement, track, wire } from 'lwc';
import updateAccountInfo from '@salesforce/apex/AccountController.updateAccountInfo';
import getAccountDocuments from '@salesforce/apex/AccountController.getAccountDocuments';

export default class AccountInfo extends LightningElement {
    @track accountName;
    @track phone;
    @track website;
    @track email;
    @track startDate;
    @track successMessage = '';
    @track successMessageClass = 'slds-hide';

    @track selectedDocuments = [];
    @track toAddress = '';
    @track emailSubject = '';
    @track emailSuccessMessage = '';
    @track emailSuccessMessageClass = 'slds-hide';

    @wire(getAccountDocuments)
    documents;

    handleUpdate() {
        // Reset success message and hide it initially
        this.successMessage = '';
        this.successMessageClass = 'slds-hide';

        // Validate Account Name (required and text)
        if (!this.accountName || typeof this.accountName !== 'string') {
            this.displayErrorMessage('Account Name must be a required text field.');
            return;
        }

        // Validate Phone (not null and in (999) 999-9999 format)
        if (!this.phone || !this.phone.match(/^\(\d{3}\) \d{3}-\d{4}$/)) {
            this.displayErrorMessage('Phone must be in the format (999) 999-9999.');
            return;
        }

        // Validate Email (required and a valid email address)
        if (!this.email || !this.isValidEmail(this.email)) {
            this.displayErrorMessage('Email must be a required valid email address.');
            return;
        }

        // Validate Start Date (a date picker with weekends disabled)
    const selectedDate = new Date(this.startDate);
    if (!this.startDate || this.isWeekend(selectedDate)) {
        this.displayErrorMessage('Start Date is required and should not be a weekend.');
        return;
    }

        // If all validations pass, call the Apex method to update account info
        updateAccountInfo({ 
            accountId: this.accountId,
            accountName: this.accountName,
            phone: this.phone,
            website: this.website,
            email: this.email,
            startDate: this.startDate
        })
        .then(result => {
            // Handle the result (e.g., set component properties or show success message)
            this.successMessage = 'Account information updated successfully!';
            this.successMessageClass = 'slds-success';
        })
        .catch(error => {
            // Handle any errors (e.g., display an error message)
            this.displayErrorMessage(error.body.message);
        });
    }

    handleDocumentSelection(event) {
        // Handle document selection (e.g., add or remove from selectedDocuments)
        const documentId = event.target.dataset.id;
        if (event.target.checked) {
            this.selectedDocuments.push(documentId);
        } else {
            const index = this.selectedDocuments.indexOf(documentId);
            if (index !== -1) {
                this.selectedDocuments.splice(index, 1);
            }
        }
    }

    handleSendEmail() {
        // Reset success message and hide it initially
        this.emailSuccessMessage = '';
        this.emailSuccessMessageClass = 'slds-hide';

        // Validate email subject and toAddress (required)
        if (!this.toAddress || !this.emailSubject) {
            this.displayEmailErrorMessage('To Address and Subject are required.');
            return;
        }

        // Call the Apex method to send email with selected documents
        sendEmailWithDocuments({ 
            toAddress: this.toAddress,
            subject: this.emailSubject,
            documentIds: this.selectedDocuments
        })
        .then(result => {
            // Handle the result (e.g., show success message)
            this.emailSuccessMessage = 'Email sent successfully!';
            this.emailSuccessMessageClass = 'slds-success';
        })
        .catch(error => {
            // Handle any errors (e.g., display an error message)
            this.displayEmailErrorMessage(error.body.message);
        });
    }

    // Helper method to display error messages
    displayErrorMessage(message) {
        this.successMessage = message;
        this.successMessageClass = 'slds-error';
    }

    // Helper method to display email error messages
    displayEmailErrorMessage(message) {
        this.emailSuccessMessage = message;
        this.emailSuccessMessageClass = 'slds-error';
    }

   
    // Helper method to validate email address
    isValidEmail(email) {
        // Regular expression for basic email validation
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    
        // Test the email against the regex
        if (emailRegex.test(email)) {
            return true; // Email is valid
        } else {
            return false; // Email is not valid
        }
    }

    // Helper method to check if a date is a weekend (Saturday or Sunday)
    isWeekend(date) {
        const day = date.getDay();
        return day === 0 || day === 6;
    }
}

