/** Admin | Fixtures **/

'use strict';
(function(app){

	var Record = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			_id: undefined
		},
		url: function(){
			return '/admin/fixtures/'+ (this.isNew() ? '' : this.id +'/');
		}
	});

	var FixturesCollection = Backbone.Collection.extend({
		model: Record,
		url: '/admin/fixtures/',
		parse: function(results) {
			app.pagingView.model.set({
				pages: results.pages,
				items: results.items
			});
			app.filterView.model.set(results.filters);
			return results.data;
		}
	});

	var Paging = Backbone.Model.extend({
		defaults: {
			pages: {},
			items: {}
		}
	});

	var Filter = Backbone.Model.extend({
		defaults: {
			name: '',
			sort: '',
			limit: ''
		}
	});

	var HeaderView = Backbone.View.extend({
		el: '#header',
		template: _.template($('#tmpl-header').html()),
		initialize: function(){
			this.model = new Record();
			this.listenTo(this.model, 'sync', this.render);
			this.render();
		},
		render: function(){
			this.$el.html(this.template(this.model.attributes));
		}
	});

	var ResultsView = Backbone.View.extend({
		el: '#results-table',
		template: _.template( $('#tmpl-results-table').html() ),
		initialize: function() {
			this.collection = new FixturesCollection(app.mainView.results.data);
			this.listenTo(this.collection, 'reset', this.render);
			this.render();
		},
		render: function(){
			this.$el.html( this.template() );
			var frag = document.createDocumentFragment();
			this.collection.each(function(record){
				var view = new ResultsRowView({model:record});
				frag.appendChild(view.render().el);
			},this);
			$('#results-rows').append(frag);

			if (this.collection.length === 0) {
				$('#results-rows').append( $('#tmpl-results-empty-row').html() );
			}
		}
	});

	var ResultsRowView = Backbone.View.extend({
		tagName: 'tr',
		template: _.template( $('#tmpl-results-row').html() ),
		events: {
			'click .btn-details': 'viewDetails'
		},
		viewDetails: function(){
			location.href = this.model.url();
		},
		render: function(){
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		}
	});

	var PagingView = Backbone.View.extend({
		el: '#results-paging',
		template: _.template($('#tmpl-results-paging').html()),
		events: {
			'click .btn-page': 'goToPage'
		},
		initialize: function() {
			this.model = new Paging({pages: app.mainView.results.pages, items: app.mainView.results.items});
			this.listenTo(this.model, 'change', this.render);
			this.render();
		},
		render: function() {
			if (this.model.get('pages').total > 1) {
				this.$el.html(this.template( this.model.attributes));

				if (!this.model.get('pages').hasPrev) {
					this.$el.find('.btn-prev').attr('disabled', 'disabled');
				}

				if (!this.model.get('pages').hasNext) {
					this.$el.find('.btn-next').attr('disabled', 'disabled');
				}
			} else {
				this.$el.empty();
			}
		},
		goToPage: function() {
			var query = $('#filters form').serialize() +'&page='+ $(event.target).data('page');
			Backbone.history.navigate('q/'+ query, { trigger: true });
			$('body').scrollTop(0);
		}
	});

	var FilterView = Backbone.View.extend({
		el: '#filters',
		template: _.template( $('#tmpl-filters').html() ),
		events: {
			'submit form': 'preventSubmit',
			'keypress input[type="text"]': 'filterOnEnter',
			'change select': 'filter'
		},
		initialize: function(){
			this.model = new Filter( app.mainView.results.filters );
			this.listenTo(this.model, 'sync', this.render);
			this.render();
		},
		render: function(){
			this.$el.html(this.template( this.model.attributes ));
			for(var key in this.model.attributes) {
				if (this.model.attributes.hasOwnProperty(key)) {
					this.$el.find('[name="'+ key +'"]').val(this.model.attributes[key]);
				}
			}
		},
		preventSubmit: function(){
			event.preventDefault();
		},
		filterOnEnter: function(){
			if (event.keyCode !== 13) { return; }
			this.filter();
		},
		filter: function() {
			var query = $('#filters form').serialize();
			Backbone.history.navigate('q/'+ query, { trigger: true });
		}
	});

	app.MainView = Backbone.View.extend({
		el: '.page .container',
		initialize: function() {
			app.mainView = this;
			this.results = JSON.parse( $('#data-results').html() );
			app.headerView = new HeaderView();
			app.resultsView = new ResultsView();
			app.filterView = new FilterView();
			app.pagingView = new PagingView();
		}
	});

	app.Router = Backbone.Router.extend({
		routes: {
			'': 'default',
			'q/:params': 'query'
		},
		initialize: function(){
			app.mainView = new app.MainView();
		},
		default: function(){
			if (!app.firstLoad) {
				app.resultsView.collection.fetch({reset: true});
			}

			app.firstLoad = false;
		},
		query: function(params) {
			app.resultsView.collection.fetch({data:params, reset:true});
			app.firstLoad = false;
		}
	});

	$(document).ready(function(){
		app.firstLoad = true;
		app.router = new app.Router();
		Backbone.history.start();
	});
}(window.pd || {}))