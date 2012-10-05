
(function ($) {
    $.fn.extend({
        gridView: function (options) {
            var defaults = {
                grid :{},
                gridHeader: {},
                gridBody: {
                    onRowClick: function () {

                    }
                
                },
                title: {
                    enabled: false
                },
                search: {
                    enabled : false ,
                    imgUrl: 'External_Files/images/search.png' 
                }
            };
            var options = $.extend(true,defaults, options);

            return this.each(function () {
            
                var o = options;
                var obj = $(this);
              // search and title  
              
                
                if( o.title.enabled){$(this).append('<div class="headerTitle"><span id="jqueryGridView_Title">' + o.title.text + '</span></div>')} ;
                if( o.search.enabled){$(this).append('<div class="headerSearch"><input name="tbSearch" type="text" id="tbSearch"><img src="'+ o.search.imgUrl +'" alt="Search"></div>').keyup(function(e){searchGrid($('#tbSearch').val(),e) , o.search.onKeyPress()});}
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
                    $('.gridBody').data('url',o.grid.ajaxUrl);
                    $('.gridBody').data('columns',o.gridBody.columns);
                    $('.gridBody').data('ajaxData',o.grid.ajaxData);
                    //o.gridBody.onRowClick()
                   $('.gridBody table tbody ').click(function(){o.gridBody.onRowClick()});
                    reloadGrid();
            });
        }
    });

})(jQuery);
 
function reloadGrid(){
    $('#tbSearch').val('') ;
    var url = $('.gridBody').data('url');
    var columns = $('.gridBody').data('columns') ;
    var ajaxData = $('.gridBody').data('ajaxData') ;
    $.ajax({
        type: "POST",
        url: url,
        data: ajaxData,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (values) {

            var renderTr = [];
            var counter = 1;
            $.each(values, function (index, value) {

                var objectValue = JSON.stringify(value);
                objectValue = objectValue.replace(/"/g, "'");


                renderTr.push('<tr id=' + counter + ' value="' + objectValue + '" class="row" onmouseover="changeGridOnMouseOver(this)" onclick="changeGridOnClick(this);">');
                for (var i = 0; i < columns.length; i++) {
                    var x = columns[i].object;
                    if (columns[i].ifValue !== undefined) {
                       
                        if (value[x] == columns[i].ifValue) { columns[i].style = columns[i].style + columns[i].addStyle } else { columns[i].style = columns[i].style.replace(columns[i].addStyle, '') }
                    }


                    renderTr.push('<td style="' + columns[i].style + '">' + value[x] + '</td>');
                }
                renderTr.push('</tr>');
                counter++;
            });
            $('.gridBody table tbody').html(renderTr.join("")).mouseout(function () { $('.gridBody table tbody tr').removeClass('onRowMouseOver'); });
        }
    });
}

function changeGridOnClick(row) {

$('.gridBody table tbody tr').removeClass('onRowMouseOver') ;
$('.gridBody table tbody tr').removeClass('onRowClick') ;
$('.gridBody table tbody tr').css('background','');
    $(row).addClass('onRowClick').css('background','#C9DCE8');
    $('#rowValues').remove();
    $(row).parents('.gridBody').append('<div id="rowValues">');
    $('#rowValues').append('<input type="hidden" id="rowId" value="'+ $(row).attr('id') +'">');
    $.each($.parseJSON($(row).attr('value').replace(/'/g, "\"")), function (index, value) {
        
        $('#rowValues').append('<input type="hidden" id="' + index + '" value="' + value + '">');
    });
    $(row).parents('.gridBody').append('</div>');
}

function changeGridOnMouseOver(row){ 
$('.gridBody table tbody tr').removeClass('onRowMouseOver') ;
    $(row).addClass('onRowMouseOver');
}
 
function searchGrid(characters,e){
    $('.gridBody table tbody tr').not(":contains('"+ characters +"')").hide();
   console.log(e.keyCode) ;
   if(e.keyCode == 8 || 46  ) {
    $(".gridBody table tbody tr:contains('"+ characters +"')").show();
}


}
         