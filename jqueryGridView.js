(function ($) {
    $.fn.extend({
        gridView: function (options) {
            var defaults = {
                grid: {
                    data: {}
                },
                gridHeader: {},
                gridBody: {
                    selectFirstRow: false,
                    selectedRowByValue: '',
                    disableClick: false,
                    onRowClick: function () {

                    },
                    onClickRelease: function () {

                    }
                },
                title: {
                    enabled: false
                },
                search: {
                    enabled: false,
                    onKeyPress: function () {

                    }
                }

            };
            var options = $.extend(true, defaults, options);

            return this.each(function () {

                var o = options;
                var obj = $(this);
                // search and title  

                if (o.title.enabled) { $(this).append('<div id="' + $(this).attr('id') + '_headerTitle" class="headerTitle"><span id="jqueryGridView_Title">' + o.title.text + '</span></div>') };
                if (o.search.enabled) { $(this).append('<div id="' + $(this).attr('id') + '_headerSearch" class="headerSearch"><input name="tbSearchBar" type="text" id="' + $(this).attr('id') + '_tbSearchBar"><img src="' + o.search.imgUrl + '" alt="Search"></div>').keyup(function (e) { searchGrid($('#' + $(this).attr('id') + '_tbSearchBar').val(), e, $(this).attr('id')), o.search.onKeyPress() }); }
                if (o.search.imgUrl == undefined) { $("#" + $(this).attr('id') + "_headerSearch img").remove(); } //if imgUrl object doesn't exists remove img tage 

                // gridView Header 
                $(this).append('<table id="' + $(this).attr('id') + '_gridHeader" class="gridHeader"><tbody><tr id="' + $(this).attr('id') + '_thTags"></tr></tbody></table>');
                var headerObject = [];
                var counter = 1;
                $.each(o.gridHeader.columns, function (index, value) {
                    headerObject.push('<th value="' + counter + '" onclick="" style="width:' + value.width + '">' + value.text + '</th>');
                    counter++;
                });

                $("#" + $(this).attr('id') + "_thTags").append(function () { return headerObject.toString() }); //fill table with th tags  
                // gridView Body
                $(this).append('<div id="' + $(this).attr('id') + '_gridBody" class="gridBody"><table><tbody></tbody></table></div>');
                $('#' + $(this).attr('id') + '_gridBody').data('url', o.grid.ajaxUrl);
                $('#' + $(this).attr('id') + '_gridBody').data('data', o.grid.data);
                $('#' + $(this).attr('id') + '_gridBody').data('columns', o.gridBody.columns);
                $('#' + $(this).attr('id') + '_gridBody').data('ajaxData', o.grid.ajaxData);
                $('#' + $(this).attr('id') + '_gridBody').data('onClickRelease', o.gridBody.onClickRelease);
                $('#' + $(this).attr('id') + '_gridBody').data('disableClick', o.gridBody.disableClick);
                //o.gridBody.onRowClick()
                $('#' + $(this).attr('id') + '_gridBody table tbody ').click(function () { o.gridBody.onRowClick() });
                var divID = $(this).attr('id');
                reloadGrid(divID, options);

            });
        }

    });

})(jQuery);

function reloadGrid(divID, o) {
    $('#' + divID + '_tbSearchBar').val('');
    var url = $('#' + divID + '_gridBody').data('url');
    var columns = $('#' + divID + '_gridBody').data('columns');
    var ajaxData = $('#' + divID + '_gridBody').data('ajaxData');
    var disableClick = $('#' + divID + '_gridBody').data('disableClick');
    var data = $('#' + divID + '_gridBody').data('data');
    console.log(data);
    //    console.log(url);
    //    console.log(columns);
    //    console.log(ajaxData);
    if ($.isEmptyObject(data)) {
        $.ajax({
            type: "POST",
            url: url,
            data: ajaxData,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (objReturn) {
                //console.log(objReturn);
                //var values = objReturn.d   //IIS7 & WIN2008 Mod
                var values = objReturn       //IIS6 & WIN2003 Mod
                var readyObject = {};
                //LOOP IN THE COLUMNS OBJECT AND GET THE DEPTH OF THE OBJECT 
                $.each(columns, function (i, v) {
                    //GET THE INDEX OF THE LAST '.' AND SUBSTRING THE ELEMENT FROM THE OBJECT 
                    if (v.object.indexOf(".") > 1) {
                        // readyObject = values[v.object.substring(0, v.object.lastIndexOf("."))];
                        readyObject = $.extend(true, readyObject, values[v.object.substring(0, v.object.lastIndexOf("."))]);
                    } else {
                        readyObject = values;
                    }
                });
                var renderTr = [];
                var counter = 1;

                $.each(readyObject, function (index, value) {

                    var objectValue = JSON.stringify(value);
                    objectValue = objectValue.replace(/'/g, "`");
                    objectValue = objectValue.replace(/"/g, "'");
                    var x = divID + '_' + counter;
                    var y = $('#divContent_gridBody_rowId').val();
                    //console.log(y);
                    if (x == y) {
                        renderTr.push('<tr id=' + divID + '_' + counter + ' value="' + objectValue + '" class="row onRowClick" style="background-color: rgb(201, 220, 232); background-position: initial initial; background-repeat: initial initial; " onmouseover="changeGridOnMouseOver(this)" onclick="changeGridOnClick(this)">');
                    } else {
                        renderTr.push('<tr id=' + divID + '_' + counter + ' value="' + objectValue + '" class="row" onmouseover="changeGridOnMouseOver(this)" onclick="changeGridOnClick(this)">');
                    }

                    for (var i = 0; i < columns.length; i++) {
                        var x = columns[i].object;
                        var indexOfDot = columns[i].object.lastIndexOf(".");
                        if (indexOfDot > 1) {
                            var colObjLength = columns[i].object.length;
                            x = columns[i].object.substring(indexOfDot + 1, colObjLength);
                        }
                        var m = columns[i].style;
                        var t = columns[i].type;
                        if (columns[i].ifValue !== undefined) {
                            $.each(columns[i].ifValue, function (y, z) {
                                if (value[x] == z.is) {
                                    columns[i].style = columns[i].style + ';' + z.style
                                }
                            });
                            //if (value[x] == columns[i].ifValue) { columns[i].style = columns[i].style + columns[i].addStyle } else { columns[i].style = columns[i].style.replace(columns[i].addStyle, '') }

                        }

                        if (t == undefined) {
                            renderTr.push('<td id="' + divID + '_' + counter + '_' + x + '" style="' + columns[i].style + '">' + value[x] + '</td>');
                        } else if (t == 'chechbox') {
                            renderTr.push('<td id="' + divID + '_' + counter + '_' + x + '" style="' + columns[i].style + '"><input type="checkbox" id="' + value[x] + '"></td>');
                        }
                        columns[i].style = m;
                    }
                    renderTr.push('</tr>');
                    counter++;
                });



                var addStyleToSelectedRow = $('#' + divID + '_gridBody_rowId').val();
                $(addStyleToSelectedRow).css('background', 'red');

                $('#' + divID + '_gridBody table tbody').html(renderTr.join("")).mouseout(function () { $('#' + divID + '_gridBody table tbody tr').removeClass('onRowMouseOver'); });

                //Remove onClick If disableClick = True 
                if (disableClick) $('#' + divID + '_gridBody table tbody tr').each(function () { $(this).removeAttr('onclick'); });
                // Do not Remove Class Row if you need to change the cursor:pointer, change it in the css file associate with your code
                if ((o.gridBody.selectedRowByValue.length) > 0) {
                    $('#' + divID + '_gridBody tr td:contains("' + o.gridBody.selectedRowByValue + '")').click();
                    var t = parseInt($('#' + divID + '_gridBody tr td:contains("' + o.gridBody.selectedRowByValue + '")').parent().index() * 29);
                    var h = parseInt($('#' + divID + '_gridBody').parent().height());
                    if (h < t) {
                        $('#' + divID + '_gridBody').scrollTop(t - h + 29);
                    }
                }
                else
                    if (o.gridBody.selectFirstRow) {
                        
                    }

            }
        });
    } else {
        //console.log(objReturn);
        //var values = objReturn.d   //IIS7 & WIN2008 Mod
        var values = data;       //IIS6 & WIN2003 Mod
        var readyObject = {};
        //LOOP IN THE COLUMNS OBJECT AND GET THE DEPTH OF THE OBJECT 
        $.each(columns, function (i, v) {
            //GET THE INDEX OF THE LAST '.' AND SUBSTRING THE ELEMENT FROM THE OBJECT 
            if (v.object.indexOf(".") > 1) {
                // readyObject = values[v.object.substring(0, v.object.lastIndexOf("."))];
                readyObject = $.extend(true, readyObject, values[v.object.substring(0, v.object.lastIndexOf("."))]);
            } else {
                readyObject = values;
            }
        });
        var renderTr = [];
        var counter = 1;

        $.each(readyObject, function (index, value) {

            var objectValue = JSON.stringify(value);
            objectValue = objectValue.replace(/'/g, "`");
            objectValue = objectValue.replace(/"/g, "'");
            var x = divID + '_' + counter;
            var y = $('#divContent_gridBody_rowId').val();
            //console.log(y);
            if (x == y) {
                renderTr.push('<tr id=' + divID + '_' + counter + ' value="' + objectValue + '" class="row onRowClick" style="background-color: rgb(201, 220, 232); background-position: initial initial; background-repeat: initial initial; " onmouseover="changeGridOnMouseOver(this)" onclick="changeGridOnClick(this)">');
            } else {
                renderTr.push('<tr id=' + divID + '_' + counter + ' value="' + objectValue + '" class="row" onmouseover="changeGridOnMouseOver(this)" onclick="changeGridOnClick(this)">');
            }

            for (var i = 0; i < columns.length; i++) {
                var x = columns[i].object;
                var indexOfDot = columns[i].object.lastIndexOf(".");
                if (indexOfDot > 1) {
                    var colObjLength = columns[i].object.length;
                    x = columns[i].object.substring(indexOfDot + 1, colObjLength);
                }
                var m = columns[i].style;
                var t = columns[i].type;
                if (columns[i].ifValue !== undefined) {
                    $.each(columns[i].ifValue, function (y, z) {
                        if (value[x] == z.is) {
                            columns[i].style = columns[i].style + ';' + z.style
                        }
                    });
                    //if (value[x] == columns[i].ifValue) { columns[i].style = columns[i].style + columns[i].addStyle } else { columns[i].style = columns[i].style.replace(columns[i].addStyle, '') }

                }

                if (t == undefined) {
                    renderTr.push('<td id="' + divID + '_' + counter + '_' + x + '" style="' + columns[i].style + '">' + value[x] + '</td>');
                } else if (t == 'chechbox') {
                    renderTr.push('<td id="' + divID + '_' + counter + '_' + x + '" style="' + columns[i].style + '"><input type="checkbox" id="' + value[x] + '"></td>');
                }
                columns[i].style = m;
            }
            renderTr.push('</tr>');
            counter++;
        });

        var addStyleToSelectedRow = $('#' + divID + '_gridBody_rowId').val();
        $(addStyleToSelectedRow).css('background', 'red');

        $('#' + divID + '_gridBody table tbody').html(renderTr.join("")).mouseout(function () { $('#' + divID + '_gridBody table tbody tr').removeClass('onRowMouseOver'); });

        //Remove onClick If disableClick = True 
        if (disableClick) $('#' + divID + '_gridBody table tbody tr').each(function () { $(this).removeAttr('onclick'); });
        // Do not Remove Class Row if you need to change the cursor:pointer, change it in the css file associate with your code
        if ((o.gridBody.selectedRowByValue.length) > 0) {
            $('#' + divID + '_gridBody tr td:contains("' + o.gridBody.selectedRowByValue + '")').click();
            var t = parseInt($('#' + divID + '_gridBody tr td:contains("' + o.gridBody.selectedRowByValue + '")').parent().index() * 29);
            var h = parseInt($('#' + divID + '_gridBody').parent().height());
            if (h < t) {
                $('#' + divID + '_gridBody').scrollTop(t - h + 29);
            }
        }
        else
            if (o.gridBody.selectFirstRow) {
              
            }

    }


}

function releaseClick(divID) {

    var $selector = $('#' + divID + ' table tbody tr');
    $selector.removeClass('onRowMouseOver onRowClick').css('background', '');
    $('#' + divID + '_rowValues').remove();

    var $fnonclickRelease = $('#' + divID + '_gridBody').data('onClickRelease');
    if ($fnonclickRelease != undefined) {
        $fnonclickRelease.call();
    }

}


function changeGridOnClick(row) {
    var targetDiv = $(row).parents('div:first').attr('id');
    releaseClick(targetDiv);
    $(row).addClass('onRowClick').css('background', '#C9DCE8');
    $(row).parents('div:first').append('<div id="' + targetDiv + '_rowValues">');
    $('#' + targetDiv + '_rowValues').append('<input type="hidden" id="' + targetDiv + '_rowId" value="' + $(row).attr('id') + '">');
    //console.log($(row).attr('value'));
    $.each($.parseJSON($(row).attr('value').replace(/'/g, "\"")), function (index, value) {
        //console.log(value); 
        value = value.replace("`", "'"); // replace all the back quotes with quotes 
        $('#' + targetDiv + '_rowValues').append('<input type="hidden" id="' + index + '" value="' + value + '">');
    });
    $(row).parents('div:first').append('</div>');

}

function changeGridOnMouseOver(row) {
    var targetDiv = $(row).parents('div:first').attr('id');
    $('#' + targetDiv + ' table tbody tr').removeClass('onRowMouseOver');
    $(row).addClass('onRowMouseOver');
}

function searchGrid(characters, e, divID) {

    releaseClick(divID);
    $.expr[':'].contains = function (n, i, m) {
        return jQuery(n).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
    };
    $('#' + divID + '_gridBody table tbody tr').not(":contains('" + characters + "')").hide();



    if (e.keyCode == 8 || 46) {
        $("#" + divID + "_gridBody table tbody tr:contains('" + characters + "')").show();
        $('#' + divID + '_gridBody table tbody tr:visible').click();
        //console.log("key down");
    }

    // CUSTOME FOR PRIME GRID COLORS 
    $("#" + divID + "_gridBody table tbody tr:visible:even ").css('background-color', '#DFEFFC');
    $("#" + divID + "_gridBody table tbody tr:visible:odd ").css('background-color', '#FFF');

}
