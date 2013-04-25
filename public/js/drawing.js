;(function(scope) {
  scope.canvas = new Canvas({
    width: 600,
    height: 400,
    id: 'canvas'
  });
  $('#clear').on('click', function() { canvas.erase(); canvas.newHistory(); });
  $('#replay').on('click', function() { canvas.erase(); canvas.replay(); });

  $('.colors li').each(function() {
    $(this).css('backgroundColor', function() {
      return $(this).data('color');
    });
    canvas.registerStrokeColor($(this).data('color'));
  }).on('click', function() {
    canvas.setStrokeColor($(this).data('color'));
    $(this).addClass('selected').siblings().removeClass('selected');
  });

  $('.sizes li').each(function() {
    var size = $(this).data('size');
    $('<div class="circle"></div>').css({
      width: size,
      height: size
    }).appendTo($(this));
    canvas.registerStrokeWidth(size);
  }).on('click', function() {
    canvas.setStrokeWidth($(this).data('size'));
    $(this).addClass('selected').siblings().removeClass('selected');
  });
})(this);