
//! 
//! Registration.js
//!
//! login and signup

(function(app){

	app.reg = {
		defaults: {
			selector: '#login',
			errorClass: 'has-error',
			errorMessageClass: 'help-block',
		},
		messages: {
			email: {
				invalid: "Your email address is not valid"
			},
			password :{
				
			},
			empty: "Required"
		},
		errors: {},
		init: function(options){
			var self = this;
			this.options = $.extend({}, this.defaults, options);
			
			this.el = el = $(this.options.selector).filter(':first');
			this.dom = {
				form: el.find('form'),
				username: el.find('.username'),
				password: el.find('.password'),
				submit: el.find('.btn-login'),
				forgot: el.find('.forgot')
			};
			
			this.attachEvents();
		},
		attachEvents: function(){
			var self = this;
			
			this.dom.username.on('blur', function(){
				setTimeout(function(){
					if (self.dom.username.val().indexOf('@') === -1 ) {
						self.validateName();
					} else {
						self.validateEmail();
					}
				}, 100);
			});
			
			this.dom.password.on('blur', function(){
				setTimeout(function(){
					if (self.isPassword(self.dom.password.val())){
						self.markValid(this);
					}
				}, 100); 
			});
			
			this.dom.form.on('submit', function(e){
				e.preventDefault();
				
				if (!self.isValid()){
					return false;
				}		
				
				self.dom.submit.attr('disabled', true);
				
				// submit the form
				$.ajax({
					method: 'post',
					data: {
						username: self.dom.username.val(),
						password: self.dom.password.val(),
					},
					success: function(response, status){
						if (!response.success) {
							if (response.errfor.length > 0) {
								for(var i in response.errfor) {
									self.addError(i, response.errfor[i])
								}
							}
							
							self.addError('username', response.errors[0]);
							self.dom.submit.removeAttr('disabled');
						} else {
							location.href = '/login/';
						}
					},
					error: function(xhr, status, err){
						
					}
				});	
			});
		},
		
		isValid: function(){
			var 
			valid = true, field, fields = this.dom.form.find('.required'), self = this;
			
			$.each(fields, function(key, value){
				field = $(value);
				
				if (field.hasClass('username')) {
					if (field.val().indexOf('@') === -1 ) {
						valid = self.validateName() && valid;
					} else {
						valid = self.validateEmail();
					}
				} else if (field.hasClass('password')){
					valid = self.isPassword(field.val()) && valid;
				}
			});
			
			return valid;	
		},
		
		/**
		 * check if username field is valid
		 * @returns {boolean}
		 */
		validateName: function(){
			if (!this.dom.username.val().length) {
				this.addError('username', this.messages.empty);
				return false;
			} else {
				this.markValid(this.dom.username);
				return true;
			}
		},
		
		/**
		 * validate the email field
		 * @returns {boolean}
		 */
		validateEmail: function(){
			var domObj = this.dom.username;
			if (!domObj.val()) {
				this.addError(domObj, this.messages.empty);
				return false;
			} else if (this.isEmail(domObj.val())) {
				this.markValid(domObj);
				return true;
			} else {
				this.addError(domObj, this.messages.email.invalid);
				return false;
			} 
		},
		
		/**
		 * determine if email is a valid format or not.
		 * @param {string} email The email to check against
		 * @returns {boolean}
		 */ 
		isEmail: function(email) {
			// This regexp is not ideal, but it is used on the back-end so it is better to stay consistent
			var re = /^([a-zA-Z0-9_\-])+(['\#\.a-zA-Z0-9_\-])*@(?!localhost|test|invalid|example)([a-zA-Z0-9_\-]+)(\.)([a-zA-Z0-9_\-]+)([\.][a-zA-Z0-9_\-]+)*$/;
			return re.test(email);
		},
		
		isPassword: function(pwd) {
			if (!pwd.length) {
				this.addError('password', this.messages.empty);
				return false;
			}
			
			return true;
		},
		
		/**
		 * add an error to the error collection and mark field as failed validation.
		 * @param {object | string} field The field to add error
		 * @param {string} err The error message to add for the field
		 * @returns {object} this The regApp object
		 */ 
		addError: function(field, err) {
			var fld;
			if (field && typeof(field) === 'string') {
				field = this.dom[field];
			}

			fld = $(field).attr('class');

			this.errors[fld] = err;
			this.markError(field);

			return this;
		},
		
		/**
		 * mark a field as failed validation and show field error
		 * @param {object} domElement The field for which we're clearing its error
		 */ 
		markError: function(domElement) {
			var field = $(domElement).attr('class');
			$(domElement).parent().addClass(this.options.errorClass).find('.' + this.options.errorMessageClass).html(this.errors[field]);
		},
		
		/**
		 * mark field as passed validation.
		 * @param {object} domElement The field to mark as valid
		 */ 
		markValid: function(domElement) {
			$(domElement).parent().removeClass(this.options.errorClass).find('.' + this.options.errorMessageClass).empty();
			this.clearError(domElement);
		},
		
		/**
		 * clear error for a field. This simply resets the error collection indexed by the field's class name.
		 * @param {object} domElement The dom element on which we're clearing the error
		 */
		clearError: function(domElement) {
			var field = $(domElement).attr('class');
			delete this.errors[field];
		},
		
		/**
		 * clear all errors on the form
		 */
		clearErrors: function(){
			this.dom.form.find(this.options.errorClass).removeClass(this.options.errorClass);
			this.errors = {};
		},
		
		/**
		 * check if a field has an error
		 * param {string} field The field name
		 * @returns {boolean}
		 */ 
		hasError: function(field) {
			if (field in this.errors) {
				return true;
			} else {
				return false;
			}
		}
	};
	
	$(document).ready(function(){
		app.reg.init();
	});
}(window.pd || {}));