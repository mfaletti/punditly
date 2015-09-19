/** Admin | Fixtures **/

'use strict';
(function(app){

	app.Fixture = Backbone.Model.extend({
		idAttribute: '_id',
		url: function(){
			return '/admin/fixtures/'+ this.id +'/';
		}
	});

	app.Identity = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			success: false,
			errors: [],
			errfor: {},
			homeTeam: '',
			awayTeam: '',
			date:'',
			competition: ''
		},
		url: function() {
			return '/admin/fixtures/'+ app.mainView.model.id +'/';
		}
	});

	app.Leagues = Backbone.Collection.extend();

	app.LeagueView = Backbone.View.extend({
		tagName: 'option',
		render: function(){
			this.$el.attr('value', this.model.get('name').toLowerCase()).html(this.model.get('name'));
			return this;
		}
	});

	app.LeaguesView = Backbone.View.extend({
		el: "#league",
		initialize: function() {
			this.listenTo(this.collection, 'reset', this.render);
		},
		render: function(){
			var frag = document.createDocumentFragment();
			var view;
			this.collection.each(function(record){
				view = new app.LeagueView({ model: record });
				frag.appendChild(view.render().el);
			},this);

			this.$el.append(frag);
			this.$el.find("option[value='" + app.mainView.model.get('competition').toLowerCase() + "']").attr('selected', 'selected');
		}
	});

	app.FixtureView = Backbone.View.extend({
		el: '#identity',
		template: _.template( $('#tmpl-identity').html() ),
		events: {
			'click .btn-update': 'update'
		},
		initialize: function() {
			this.model = new app.Identity();
			this.model.set({
				_id: app.mainView.model.id,
				homeTeam: app.mainView.model.get('homeTeam'),
				awayTeam: app.mainView.model.get('awayTeam'),
				competition: app.mainView.model.get('competition'),
				date: app.mainView.model.get('date')
			});
			this.listenTo(this.model, 'change', this.syncUp);
			this.listenTo(this.model, 'sync', this.render);
			this.render();
		},
		syncUp: function() {
			app.mainView.model.set({
				homeTeam: this.model.get('homeTeam'),
				awayTeam: this.model.get('awayTeam'),
				competition: this.model.get('competition'),
				date: this.model.get('date')
			});
		},
		render: function() {
			this.$el.html(this.template( this.model.attributes ));

			var leagues = new app.Leagues();
			app.leaguesView = new app.LeaguesView({collection:leagues});
			leagues.reset(app.mainView.results.leagues);

			$('#home-team, #away-team').typeahead({
				source: app.mainView.results.teams
			});

			$('#datetimepicker').datetimepicker().val(moment(this.model.get('date')).format('MM/DD/YYYY h:mm A'));
		},
		update: function(e) {
			e.preventDefault();
			this.model.save({
				awayTeam: this.$el.find('[name="awayTeam"]').val(),
				homeTeam: this.$el.find('[name="homeTeam"]').val(),
				competition: this.$el.find('[name="league"]').val(),
				date:new Date(this.$el.find('#datetimepicker').val())
			});
		}
	});

	app.HeaderView = Backbone.View.extend({
		el: '#header',
		template: _.template($('#tmpl-header').html()),
		initialize: function(){
			this.model =  app.mainView.model;
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
			return '/admin/fixtures/'+ app.mainView.model.id +'/';
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
							location.href = '/admin/fixtures';
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
			this.results = JSON.parse($('#data-results').html());
			this.model = new app.Fixture(this.results.fixture);
			app.headerView = new app.HeaderView();
			app.fixtureView = new app.FixtureView();
			app.deleteView = new app.DeleteView();
		}
	});

	$(document).ready(function(){
		app.mainView = new app.MainView();
	});
}(window.pd || {}))