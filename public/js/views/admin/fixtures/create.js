/**! create new fixture **/
'use strict';

(function(app){
	var Fixture = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			_id: undefined,
			date: '',
			location: '',
			homeTeam: '',
			awayTeam: '',
			competition: ''
		},
		url: function(){
			return '/admin/fixtures/'+ (this.isNew() ? '' : this.id +'/');
		}
	});

	var Team = Backbone.Model.extend({
		idAttribute: '_id'
	});

	var Leagues = Backbone.Collection.extend();
	var Teams = Backbone.Collection.extend({
		model: Team
	});

	var Alert = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			success: false,
			errors:[],
			errfor: {}
		}
	});

	var AlertsView = Backbone.View.extend({
		el:'#alerts',
		template: _.template( $('#tmpl-alerts').html() ),
		initialize: function() {
			this.model = new Alert();
			this.listenTo(app.fixtureView.model, 'sync', this.render);
			this.render();
		},
		render: function() {
			this.$el.html(this.template( this.model.attributes ));
		}
	});

	var TeamView = Backbone.View.extend({
		tagName: 'li',
		render: function(){
			this.$el.attr('value', this.model.get('_id')).html(this.model.get('name'));
			return this;
		}
	});

	var LeagueView = Backbone.View.extend({
		tagName: 'option',
		render: function(){
			this.$el.attr('value', this.model.get('name')).html(this.model.get('name'));
			return this;
		}
	});

	var LeaguesView = Backbone.View.extend({
		el: "#league",
		initialize: function() {
			this.listenTo(this.collection, 'reset', this.render);
		},
		render: function(){
			var frag = document.createDocumentFragment();
			var view;
			this.collection.each(function(record){
				view = new LeagueView({ model: record });
				frag.appendChild(view.render().el);
			},this);

			$(this.$el).append(frag);
		}
	});

	var HomeTeamView = Backbone.View.extend({
		el: '#home-team',
		initialize: function(){
			$(this.el).typeahead({
				source: app.results.teams
			});
		}
	});

	var AwayTeamView = Backbone.View.extend({
		el: '#away-team',
		initialize: function(){
			/*$(this.el).autocomplete({
				appendTo: '#awaySuggest',
				delay: 250,
				source: function(request,response) {
					/*$.ajax({
						url: '/search',
						dataType: "json",
						data: {
							q: request.term,
							wt: 'json',
							omitHeader: true
						},
						success: function(data){
							var bucket = [];
							$.each(data.docs, function(k,v){
								bucket.push(v.name);
							});
							response(bucket);
						}
					});*/
					/*var match = new RegExp("^" + $.ui.autocomplete.escapeRegex(request.term), "i");
					var res = $.map(app.results.teams, function(o){
						return {
							label:o.name
						};
					});

					response($.grep(res, function(item){
						return match.test(item.label);
					}));
				}
			});*/
			$(this.el).typeahead({
				source: app.results.teams
			});
		}
	});

	var FixtureView = Backbone.View.extend({
		el: $('form'),
		events: {
			'submit': 'preventSubmit'
		},
		initialize: function() {
			this.model = new Fixture();
		},
		validate: function() {
			var valid = true;
			app.alertsView.$el.empty();

			if (! app.leaguesView.$el.val()) {
				app.leaguesView.$el.closest('.form-group').addClass('has-error');
				app.leaguesView.$el.closest('.form-group').find('.help-block').html("Required");
				valid = false;
			}

			if (! app.homeTeamView.$el.val()) {
				app.homeTeamView.$el.closest('.form-group').addClass('has-error');
				app.homeTeamView.$el.closest('.form-group').find('.help-block').html("Required");
				valid = false;
			}

			if (! app.awayTeamView.$el.val()) {
				app.awayTeamView.$el.closest('.form-group').addClass('has-error');
				app.awayTeamView.$el.closest('.form-group').find('.help-block').html("Required");
				valid = false;
			}

			if (! this.$el.find('#datetimepicker').val()) {
				this.$el.find('#datetimepicker').closest('.form-group').addClass('has-error');
				this.$el.find('#datetimepicker').closest('.form-group').find('.help-block').html("Required");
				valid = false;
			}

			if (app.awayTeamView.$el.val() && (app.awayTeamView.$el.val() === app.homeTeamView.$el.val())) {
				valid = false;
				app.alertsView.model.set({success: false,errors:["Home team cannot be same as Away team"]});
				app.alertsView.render();
			}

			if (valid) {
				this.model.set({
					homeTeam:app.homeTeamView.$el.val(),
					awayTeam:app.awayTeamView.$el.val(),
					competition:app.leaguesView.$el.val(),
					date:new Date(this.$el.find('#datetimepicker').val())
				});

				this.model.save(null, {
					success: function(model, response) {
						app.alertsView.model.set(response);
						if (response.success) {
							location.href = '/admin/fixtures';
						} else {
							app.alertsView.model.set(response);
						}
					}
				});
			}
		},
		preventSubmit: function(e){
			e.preventDefault();
			this.validate();
		},
	});

	app.MainView = Backbone.View.extend({
		el: 'container',
		initialize: function() {
			var results = JSON.parse( $('#data-results').html());
			app.results = results;
			var leagues = new Leagues();

			app.mainView = this;
			app.fixtureView = new FixtureView();
			app.alertsView = new AlertsView();
			app.homeTeamView = new HomeTeamView();
			app.awayTeamView = new AwayTeamView();
			app.leaguesView = new LeaguesView({collection:leagues});
			leagues.reset(results.leagues);

			// init date picker plugin
			$('#datetimepicker').datetimepicker();
		}
	});

	$(document).ready(function(){
		app.mainView = new app.MainView();
	});
}(window.pd || {}));