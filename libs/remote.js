module.exports = {
  disable_on_code: function(message){
    return "$('body').append('<div id=\"wive-disable\" >" + message + "</div>');"
  },

  disable_off_code: function(){
    return "$('#wive-disable').remove();";
  }
}