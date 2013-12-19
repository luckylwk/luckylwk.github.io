//	COPYRIGHT MONTROUT LIMITED 2013
//
//	For further information contact info@montrout.net
//
//	=================================================
//
//	jQUERY EXTENSIONS
//
//	empty.
//
//	=================================================
//
//	CUSTOM HELPER FUNCTIONS HERE.
//
$svgURL = 'http://www.w3.org/2000/svg';
function func_setAttributes( $thisEL, $attrs ){
	for( var key in $attrs ){ $thisEL.setAttribute(key, $attrs[key]); }
}
function func_createGroup( $groupID ){
	var tmpG = document.createElementNS($svgURL, "g");
    func_setAttributes(	tmpG, { 'id':$groupID, 'shape-rendering':'inherit', 'pointer-events':'all' } );
    return tmpG;
}
function func_drawLine( $varObj, $appEL ){
	//	VARIABLES Object built as: xStart, xEnd, yStart, yEnd, cssClass
	var tmpL = document.createElementNS($svgURL, "line");
	func_setAttributes( tmpL, { 'x1':$varObj.xStart, 'x2':$varObj.xEnd, 'y1':$varObj.yStart, 'y2':$varObj.yEnd, 'class':$varObj.cssClass } );
	$appEL.appendChild(tmpL);
}	
function func_drawPieSlice( $varObj, $appEL ){
	//	VARIABLES Object built as: xCentre, xStart, xEnd, yCentre, yStart, yEnd, radius, cssClass, type (as 'PIE' or 'DONUT')
	var tmpP = document.createElementNS($svgURL, "path");
	if( $varObj.type=='PIE' ){
		func_setAttributes(tmpP, { 	'd':'M'+$varObj.xCentre+','+$varObj.yCentre+' L'+$varObj.xStart+','+$varObj.yStart+' A'+$varObj.radius+','+$varObj.radius+' 0 0,1 '+$varObj.xEnd+', '+$varObj.yEnd+' z', 'class':$varObj.cssClass, 'data-s':$varObj.iter });
	} else if( $varObj.type=='DONUT' ){
		var donut = Math.round(0.5*$varObj.radius);
		func_setAttributes(tmpP, { 	'd':'M'+Math.round(0.5*($varObj.xStart+$varObj.xCentre))+','+Math.round(0.5*($varObj.yStart+$varObj.yCentre))+' L'+$varObj.xStart+','+$varObj.yStart+' A'+$varObj.radius+','+$varObj.radius+' 0 0,1  '+$varObj.xEnd+','+$varObj.yEnd+'  L'+Math.round(0.5*($varObj.xEnd+$varObj.xCentre))+','+Math.round(0.5*($varObj.yEnd+$varObj.yCentre))+' A'+donut+','+donut+' 0 0,0  '+Math.round(0.5*($varObj.xStart+$varObj.xCentre))+','+Math.round(0.5*($varObj.yStart+$varObj.yCentre))+' z', 'class':$varObj.cssClass, 'data-s':$varObj.iter });
	}
	$appEL.appendChild(tmpP);
}
function func_drawCircle( $varObj, $appEL ){
	var tmpC = document.createElementNS($svgURL, "circle");
	func_setAttributes(tmpC, { 	'cx':$varObj.cX, 'cy':$varObj.cY, 'r':$varObj.R, 'class':$varObj.cssClass });
	$appEL.appendChild(tmpC);
}

//
//	=================================================
//	=================================================
//	=================================================
//
//	START OF CHARTING FUNCTIONS
//
//	=================================================
//	
//	PIE AND DONUT CHART
//
function func_buildChart_PIEDONUT( $svgID, $dataObj ){
			
	var $svgEL = document.getElementById($svgID);
	var $svg_width = $($svgEL).width();
	var $svg_height = $($svgEL).height();
	var $margin = 10;
	$('#'+$svgID+'_legend').width($svg_width);
	
	//	Set variables.
	var x_center = Math.round($svg_width/2);
	var y_center = Math.round($svg_height/2);
	var r = Math.min(x_center,y_center)-$margin;
	var startAngle = -0.5*Math.PI;
	
	//	Calculate variables.
	var dataSum = 0, sum_tmp = 0;
	for( var i=0; i<$dataObj.data.length; i++ ) { dataSum += $dataObj.data[i]; }
	var x_coor = new Array(), y_coor = new Array();
	for( var i=0; i<$dataObj.data.length; i++ ){
		sum_tmp += $dataObj.data[i];
		x_coor[i] = x_center + Math.round(r*Math.cos(2*Math.PI*sum_tmp/dataSum+startAngle));
		y_coor[i] = y_center + Math.round(r*Math.sin(2*Math.PI*sum_tmp/dataSum+startAngle));
	}
	
	var tmpG = func_createGroup( 'slices' );
	for( var i=0; i<$dataObj.data.length; i++ ){
		if( i==0 ){
			func_drawPieSlice( { xCentre:x_center, xStart:x_center, xEnd:x_coor[i], yCentre:y_center, yStart:y_center-r, yEnd:y_coor[i], radius:r, cssClass:'pieSlice s'+i+'', type:$dataObj.type, iter:i }, tmpG );
		} else {
			func_drawPieSlice( { xCentre:x_center, xStart:x_coor[i-1], xEnd:x_coor[i], yCentre:y_center, yStart:y_coor[i-1], yEnd:y_coor[i], radius:r, cssClass:'pieSlice s'+i+'', type:$dataObj.type, iter:i }, tmpG );
		}
	}
	$svgEL.appendChild(tmpG);
	delete tmpG;
	
	//	Create LEGEND
	var objLegend = $('<ul style="width:'+($svg_width-20)+'px;margin-left:20px;"></ul>');
	for( var i=0; i<$dataObj.data.length; i++ ){
		$('<li class="li_s'+i+' hide"><span class="legend s'+i+'"></span>'+$dataObj.label[i]+' ('+Math.round(100*$dataObj.data[i]/dataSum)+'%)</li>').appendTo(objLegend);
	}
	objLegend.appendTo('#'+$svgID+'_legend');
}
	

