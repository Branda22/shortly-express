Shortly.loginView = Backbone.View.extend({
  className: 'creator',
  template: Templates['create'],
  render: function() {
    this.$el.html( this.template() )
    return this
  }
})