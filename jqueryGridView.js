
(function ($) {
    $.fn.extend({
    
        gridView: function (options) {
            var defaults = {
                grid :{
                   
                },
                gridHeader: {
                    
                },
                gridBody:{
                
                },
                title: {
                    enabled: false,
                },
                search: {
                    enabled : false , 
                }
            };
           
            var options = $.extend(defaults, options);
           
            return this.each(function () {
                var o = options;
                var obj = $(this);
              // search and title  
              
                reloadGrid(o.grid.ajaxUrl,o.gridBody.columns);
                if( o.title.enabled){$(this).append('<div class="headerTitle"><span>' + o.title.text + '</span></div>')} ;
                if( o.search.enabled){$(this).append('<div class="headerSearch"><input name="tbSearch" type="text" id="tbSearch"><img src="'+ o.search.imgUrl +'" alt="Search"></div>').keydown(function(){reloadGrid(o.grid.ajaxUrl,o.gridBody.columns)});}
                if(o.search.imgUrl == undefined){$(".headerSearch img").remove();} //if imgUrl object doesn't exists remove img tage 

              // gridView Header 
               $(this).append('<table class="gridHeader"><tbody><tr id="thTags"></tr></tbody></table>') ;
                    var headerObject =[] ;
                    var counter = 1 ;
                    $.each(o.gridHeader.columns ,function(index,value){
                        headerObject.push('<th value="'+ counter +'" onclick="" style="width:' +value.width+'">'+ value.text + '</th>') ;
                        counter ++ ;
                    });

                    $("#thTags").append(function(){ return headerObject.toString()}); //fill table with th tags  
              // gridView Body
                    $(this).append('<div class="gridBody"><table><tbody></tbody></table></div>');

            });
        }
    });

})(jQuery);
function reloadGrid(url,columns){
           $.ajax({
	                    type: "POST",
	                    url: url,
	                    data: "{'cipEventID' : 12536}",
	                    dataType: "json",
	                    contentType: "application/json; charset=utf-8",
	                    success: function (values) {
                       console.log(values) ;
                        var renderTr = [] ; 
                        var counter = 1 ; 
                            $.each(values, function(index,value){ 
                                    renderTr.push('<tr id='+ counter +' value='+ JSON.stringify(value) +' class="row" onmouseover="changeGridOnMouseOver(this)" onclick="changeGridOnClick(this);">') ;
                                    for(var i=0 ; i< columns.length ; i++){
                                    var x = columns[i].object ;
                                    renderTr.push('<td style="'+ columns[i].style +'">'+ value[x] +'</td>');
                                    }
                                    renderTr.push('</tr>') ;
                                    counter ++ ; 

                            });
                          $('.gridBody table tbody').html(renderTr.join("")).mouseout(function(){$('.gridBody table tbody tr').removeClass('onRowMouseOver') ;});
                        }});
    
}
function changeGridOnClick(row){
$('.gridBody table tbody tr').removeClass('onRowMouseOver') ;
$('.gridBody table tbody tr').removeClass('onRowClick') ;
$('.gridBody table tbody tr').css('background','');
    $(row).addClass('onRowClick').css('background','#C9DCE8');
    console.log() ;
    $.each($.parseJSON($(row).attr('value')) , function(index,value){
      $(row).parents('.gridBody').append('mina');
    }) ;
}
function changeGridOnMouseOver(row){ 
$('.gridBody table tbody tr').removeClass('onRowMouseOver') ;
    $(row).addClass('onRowMouseOver');
}
 
 
         