/* edit.js */

(function(app) {
	'use strict';

	app.Team = Backbone.Model.extend({
		idAttribute: '_id',
		url: function(){
			return '/admin/teams/'+ this.id +'/';
		}
	});

	app.Identity = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			success: false,
			errors: [],
			errfor: {},
			name: '',
			park: '',
			league: ''
		},
		url: function() {
			return '/admin/teams/'+ app.mainView.model.id +'/';
		},
		parse: function(response) {
			if (response.team) {
				app.mainView.model.set(response.team);
				delete response.team;
			}

			return response;
		}
	});

	app.IdentityView = Backbone.View.extend({
		el: '#identity',
		template: _.template( $('#tmpl-identity').html() ),
		events: {
			'click .btn-update': 'update'
		},
		initialize: function() {
			this.model = new app.Identity();
			this.syncUp();
			this.listenTo(app.mainView.model, 'change', this.syncUp);
			this.listenTo(this.model, 'sync', this.render);
			this.render();
		},
		syncUp: function() {
			this.model.set({
				_id: app.mainView.model.id,
				name: app.mainView.model.get('name'),
				park: app.mainView.model.get('park'),
				league: app.mainView.model.get('league')
			});
		},
		render: function() {
			this.$el.html(this.template( this.model.attributes ));

			for (var key in this.model.attributes) {
				if (this.model.attributes.hasOwnProperty(key)) {
					this.$el.find('[name="'+ key +'"]').val(this.model.attributes[key]);
				}
			}
		},
		update: function() {
			this.model.save({
				name: this.$el.find('[name="name"]').val(),
				park: this.$el.find('[name="park"]').val(),
				league: this.$el.find('[name="league"]').val()
			});
		}
	});

	var Leagues = Backbone.Collection.extend();
	var LeagueView = Backbone.View.extend({
		tagName: 'option',
		render: function(){
			this.$el.attr('value', this.model.get('name')).html(this.model.get('name'));
			return this;
		}
	});

	var LeaguesView = Backbone.View.extend({
		el: '#leagues',
		initialize: function() {
			this.listenTo(this.collection, 'reset', this.render);
		},
		render: function(){
			var frag = document.createDocumentFragment();
			this.collection.each(function(record){
				var view = new LeagueView({model:record});
				frag.appendChild(view.render().el);
			},this);
			$(this.$el).append(frag);
			this.$el.val(app.mainView.model.get('league'));
		}
	});

	app.HeaderView = Backbone.View.extend({
		el: "#header",
		template: _.template( $('#tmpl-header').html() ),
		initialize: function() {
			this.model = app.mainView.model;
			this.listenTo(this.model, 'sync', this.render);
			this.render();
		},
		render: function(){
			this.$el.html(this.template(this.model.attributes));
		}
	});

	app.Delete = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			success: false,
			errors:[],
			errfor: {}
		},
		url: function(){
			return '/admin/teams/'+ app.mainView.model.id +'/';
		}
	});

	app.DeleteView = Backbone.View.extend({
		el: '#delete',
		template: _.template( $('#tmpl-delete').html() ),
		events: {
			'click .btn-delete': 'delete',
		},
		initialize: function() {
			this.model = new app.Delete({ _id: app.mainView.model.id });
			this.listenTo(this.model, 'sync', this.render);
			this.render();
		},
		render: function() {
			this.$el.html(this.template( this.model.attributes ));
		},
		delete: function() {
			if (confirm('Are you sure?')) {
				this.model.destroy ({
					success: function(model, response) {
						if (response.success) {
							location.href = '/admin/teams';
						} else {
							app.deleteView.model.set(response);
						}
					}
				});
			}
		}
	});

	app.MainView = Backbone.View.extend({
		el: '.page .container',
		initialize: function() {
			app.mainView = this;
			var leagues = new Leagues();
			this.results = JSON.parse( unescape($('#data-record').html()));
			this.model = new app.Team( this.results.team );

			app.headerView = new app.HeaderView();
			app.identityView = new app.IdentityView();
			app.deleteView = new app.DeleteView();

			app.leaguesView = new LeaguesView({collection:leagues});
			leagues.reset(this.results.leagues);
		}
	});

	$(document).ready(function(){
		app.mainView = new app.MainView();
	});
}(window.pd || {}));