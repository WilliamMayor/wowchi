var message = {
    template_error: _.template("<li class='error'><%= message %><a class='close' href='javascript:void(0)'><i class='fa fa-times fa-fw'></i></a></li>"),
    template_warning: _.template("<li class='warning'><%= message %><a class='close' href='javascript:void(0)'><i class='fa fa-times fa-fw'></i></a></li>"),
    error: function(msg) {
        Rollbar.error(msg);
        $("#messages").append(message.template_error({message: msg}));
    },
    warning: function(msg) {
        Rollbar.warning(msg);
        $("#messages").append(message.template_warning({message: msg}));
    },
    init: function() {
        $("#messages").on('click', 'li a.close', function() {
            $(this).parents("li").remove();
        });
    }
};