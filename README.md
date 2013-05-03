IMGResponsive
=============

jQuery plugin for swapping out image src's at developer-defined breakpoints.

Image file naming convention:
prefix-breakpointLabel.ext AND prefix-breakpointLabel-x2.ext (i.e. "myImage-tablet.png" AND "myImage-tablet-x2.png").

Markup Example:
<img src="blank.gif" data-image="images/image.png" alt="text" class="instance1" />
<img src="blank.gif" data-image="images/image2.png" alt="text" class="instance2" />

<script src="//code.jquery.com/jquery-1.9.1.min.js"></script>
<script src="js/imgResponsive.js"></script>
<script>
	$(function() {
		$('.instance1').imgResponsive();

		$('.instance2').imgResponsive({
			breakpoints:
			[{
				label: 'handheld',
				enter: 0,
				exit: 767
			},{
				label: 'other',
				enter: 768,
				exit: 10000
			}]
		});
	});
</script>