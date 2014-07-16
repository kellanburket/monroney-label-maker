<?php 
$logo_handler = get_user_upload_handler('dealershipLogo'); 
$logo = $logo_handler->get_form_fields(
	array("Choose File", "Upload Your Logo"), 
	"tag-button red-text", 
	array('choose-file', 'upload-logo'));

$label_handler = get_user_upload_handler('customLabel'); 
$label = $label_handler->get_form_fields(
	array("Choose Image", "Upload Image"), 					//button text
	"tag-button red-text", 									//classes
	array('choose-label', 'upload-label'),					//indices
	array('gallery' => 'tag-gallery')						//data
	);

//'<li><input class="tag-checkbox" type="checkbox" /><span>'.$option_name.'</span><div class="option-price float-right"><span class="dollar-sign">&#36;</span><input class="tag-input" type="text"/></div></li>';

?>
                        
                       
<div id="modal">
	<div id="modal-content">
		<img id="page-loader" src="<?php plugins_url('label-maker/js/modal/loader.gif', __FILE__); ?>">
	</div>
</div>
<div id="overlay" class="page-section-overlay">
	<div id="tag-generator">
		<form id="tag-preview">
	    	<h2 class="tag-h2">Label Preview</h2>
	        <div id="tag-preview-window">
	        	<div id="tag-preview-header" class="tag-preview-section white-background">
	
	            	<img id="dealershipLogo" class="invisible" />
	                <h3 class="preview-h3 align-center" id="dealershipName"></h3>
	                <h4 class="preview-h4 align-center" id="dealershipTagline"></h4>
	                <h4 class="preview-h4 align-center" id="additionalInfo"></h4>
	            </div>
	            <div id="tag-preview-vitals" class="tag-preview-section white-background">
	                <input class="preview-section-title color-white align-center" name="title_1" value="Dealer Added Equipment & Services" />
                    <!-- <input class="preview-section-title color-white align-center" name="title_0" value="Consumer Protection Label" /> -->
	                <ul class="white-background">
	                    <li><span class="preview-label">Stock No.:</span><span class="float-right preview-span" id="stockNo"></span></li>
	                    <li><span class="preview-label">VIN:</span><span class="float-right preview-span" id="vin"></span></li>
	                    <li><span class="preview-label">Make:</span><span class="float-right preview-span" id="make"></span></li>
	                    <li><span class="preview-label">Model:</span><span class="float-right preview-span" id="model"></span></li>
	                    <li><span class="preview-label">Year:</span><span class="float-right preview-span" id="year"></span></li>
						<li><span class="preview-label">Trim:</span><span class="float-right preview-span" id="trim"></span></li>
	                    <li><span class="preview-label">MSRP:</span><span class="float-right preview-span" id="msrp">$0.00</span></li>
	                </ul>
	            <!-- </div> -->
	            <!-- <div id="tag-preview-info" class="tag-preview-section white-background"> -->
					
	                <ul id="addendumOptions" class="white-background">
						<li>
							<input class="list-head" value="Exterior Options">
			                <ul id="exteriorOptions" class="indent-1"></ul>
						</li>
						
						<li>
							<input class="list-head" value="Interior Options">
			                <ul id="interiorOptions" class="indent-1"></ul>
						</li>
	
						<li>
							<input class="list-head" value="Discounts and Specials">
			                <ul id="discounts" class="indent-1"></ul>
						<li>
	                </ul>

					<fieldset class="total-block">
						<label class="list-head total-label" for="total">Total</label>
						<input id="total" name="total" class="total-field align-right">
					</fieldset>
	            </div>
	
	            <div id="tag-preview-footer" class="tag-preview-section white-background">
					<input class="preview-section-title color-white align-center" name="title_2" value="Consult Free Gas Mileage Guide" />
	           		<img id="customLabel" />
	            </div>
	        </div>
	    </form>


		<div id="tag-options">
	    	<h2 class="tag-h2">Label Options</h2>
	    	<div class="tag-tabs">
	        	<div class="tag-tab-holder active" id="tag-tab-holder-0">
	            	<div class="tag-tab"></div>
	                <span class="tag-tab-text">Branding Options</span>
	            </div>
	        	<div class="tag-tab-holder inactive" id="tag-tab-holder-1">
	            	<div class="tag-tab"></div>
	                <span class="tag-tab-text">Vehicle info</span>
	            </div>
	        	<div class="tag-tab-holder inactive" id="tag-tab-holder-2">
	            	<div class="tag-tab"></div>
	                <span class="tag-tab-text">Addendum Options</span>
	            </div>
	        	<div class="tag-tab-holder inactive" id="tag-tab-holder-3">
	            	<div class="tag-tab"></div>
	                <span class="tag-tab-text">Deals and Specials</span>
	            </div>
	        </div>
	        <form class="tag-frames" enctype="multipart/form-data" action="" method="POST">
				<?php wp_nonce_field('process_user_upload', '_file_upload_handler', true, true); ?>
	            <div class="tag-frame visible" id="tag-frame-0">
	            	<div class="tag-row row-1 divider divider-bottom">
	                	<div class="tag-col divider divider-right first-col col-1">
	                    	<h4 class="tag-h4">Label Color</h4>
	                    	<ul class="tag-h-ul">
								<li class="colorbox-wrap"><div class="colorbox blue-background"></div></li>
	                        	<li class="colorbox-wrap selected"><div class="colorbox green-background"></div></li>
	                        	<li class="colorbox-wrap"><div class="colorbox red-background"></div></li>
	                        	<li class="colorbox-wrap"><div class="colorbox gray-background"></div></li>
	                        	<li class="colorbox-wrap"><div class="colorbox black-background"></div></li>
	                        </ul>
	                    </div>
	                    <div class="tag-col col-2">
	                    	<h4 class="tag-h4">Logo Branding</h4>
	                    	<?php echo $logo; ?>
	                    	<input type="checkbox" name="toggleVisibility" />
	                        <label for="toggleVisibility">Toggle Visibility</label>
	                    </div>
	                </div>
	            	<div class="tag-row divider divider-bottom row-2">
	                	<div class="tag-col col-1">
	                    	<h4 class="tag-h4">Custom Text Branding</h4>
	                    	<ul class="tag-v-ul">
	                        	<li>
	                                <input type="text" class="tag-input absolute" name="dealershipName" placeholder="[Dealership Name]" />
	                        	</li>
	                        	<li>
	                                <input type="text" class="tag-input absolute" name="dealershipTagline" placeholder="[Tagline]" />
	                        	</li>
	                        	<li>
	                                <input type="text" class="tag-input absolute" name="additionalInfo" placeholder="[Additional Info]" />
	                        	</li>
	                        </ul>
	                    </div>
	                    <div class="tag-col col-2">
	                    	<h4 class="tag-h4">Font Type</h4>
	                    	<ul class="tag-v-ul">
	                        	<li>
	                            	<input type="radio" class="tag-input" name="fontFamily" value="sans-serif" selected />
	                                <span class="font-sans-serif">Sans Serif</span>
	                            </li>
	                            <li>
	                            	<input type="radio" class="tag-input" name="fontFamily" value="serif" />
	                                <span class="font-serif">Serif</span>
	                            </li>
	                            <li>
	                            	<input type="radio" class="tag-input" name="fontFamily" value="monospace" />
	                                <span class="font-monospace">Monospace</span>
	                            </li>
	                        </ul>
	                    </div>
	                    <div class="tag-col col-3">
	                    	<h4 class="tag-h4">Font Style</h4>
	                    	<ul class="tag-v-ul">
	                        	<li>
	                            	<input type="checkbox" class="tag-input font-sans-serif" name="fontWeight" value="bold" />
	                                <span class="bf font-sans-serif">Bold</span>
	                            </li>
	                            <li>
	                            	<input type="checkbox" class="tag-input font-sans-serif" name="fontStyle" value="italic" />
	                                <span class="ital font-sans-serif">Italic</span>
	                            </li>
	                        </ul>
	                    </div>
	
	                </div>
	            	<div class="tag-row row-3">
	                    <div class="tag-col col-1">
	                    	<h4 class="tag-h4">Label Button</h4>
	                        <p class="tag-headnote">Use your own image:</p>
							<?php echo $label; ?>
	                        <label for="labelCaption" class="tag-label new-line">Caption (If Any)</label>
	                        <textarea name="labelCaption" class="tag-input"></textarea>
	                    </div>
	                    <div class="tag-col col-2">
	                    	<div class="tag-gallery">
	                        </div>	
	                    </div>
	                </div>
                
	            </div>
	        	<div class="tag-frame invisible" id="tag-frame-1">
	            	<div class="tag-row row-1">
	                	<div class="tag-col col-1">
	                    	<h4 class="tag-h4">Vehicle Information</h4>
							<fieldset name="vehicleConfig">
	                            <ul class="tag-v-ul">
	                                <li id="vehicleMakeConfig">
	                                    <label class="tag-label width-short run-in" for="vehicleMake">Make</label>
	                                    <button class="destroy-button run-in">&ndash;</button>
	                                    <select class="tag-select" name="make">
	                                    	<option value='select_all' selected>[Select Make]</option>
	                                    	<option class="green-text" value='add_new'>[Add New]</option>
	                                    </select>
	                                    <input name="make" data-type="make" data-id="" type="text" class="absolute-right config-input run-in tag-input" placeholder="[make]">
	                                    <button class="add-button absolute-right run-in">+</button>
	                                </li>
	                                <li id="vehicleModelConfig">
	                                    <label class="tag-label width-short run-in" for="vehicleModel">Model</label>
	                                    <button class="destroy-button run-in">&ndash;</button>
	
	                                    <select class="tag-select" name="model">
	                                    	<option value='select_all' selected>[Select Model]</option>
	                                    	<option class="green-text" value='add_new'>[Add New]</option>
	                                    </select>
	                                    <input name="model" data-type="model" data-id="" type="text" class="absolute-right config-input run-in tag-input" placeholder="[model]">
	                                    <button class="add-button absolute-right run-in">+</button>
	
	                                </li>
	                                <li id="vehicleYearConfig">
	                                    <label class="tag-label width-short run-in" for="vehicleYear">Year</label>
	                                    <button class="destroy-button run-in">&ndash;</button>
	                                    <select class="tag-select" name="year">
	                                    	<option value='select_all' selected>[Select Year]</option>
	                                    	<option class="green-text" value='add_new'>[Add New]</option>
	                                    </select>
	                                    <input name="year" type="text" data-type="year" data-id="" class="absolute-right config-input run-in tag-input" placeholder="[year]">
	                                    <button class="add-button absolute-right run-in">+</button>
	
	                                </li>
	                                <li class="vehicle-numbers">
	                                    <label class="tag-label width-short" for="vehicleTrime">Stock Number</label>
	                                    <input class="tag-input float-right" type="text" name="stockNo" />
	                                </li>
	                                <li class="vehicle-numbers">
	                                    <label class="tag-label width-short" for="vehicleTrime">Trim</label>
	                                    <input class="tag-input float-right" type="text" name="trim" />
	                                </li>
	                                <li class="vehicle-numbers">
	                                    <label class="tag-label width-short" for="vehicleVIN">VIN</label>
	                                    <input class="tag-input float-right" maxlength="16" type="text" name="vin" />
	                                </li>
	                                <li class="vehicle-numbers">
	                                    <label class="tag-label" for="vehicle-msrp">MSRP</label>
	                                    <input class="tag-input float-right" type="text" name="msrp" />                                
	                                </li>
	                            </ul>
							</fieldset>
	                    </div>
	                </div>
	            </div>
	            <div class="tag-frame invisible" id="tag-frame-2">
					<div class="tag-row row-1">
						<div class="tag-col col-1">
	                        <h4 class="tag-h4 block-label">Exterior Options</h4>
	                     </div>
	                     <div class="tag-col col-2">
	                     	<ul id="exterior-options" class="block-list">
	                        	<li class="add-new-option" id="add-new-exterior-option">
	                            	<span class="hover-blue" id="add-new-exterior-item">Add New Option</span>
	                        		<div class="float-right">
	                                    <button class="add-button option-button" id="exterior-add-button">+</button>
	                                    <input type="text" placeholder="" id="exterior-input" class="tag-input option-input" />
	                                </div>
	                            </li>
	                        </ul>
	                     </div>
					</div>
	
	                <div class="tag-row row-2">
						<div class="tag-col col-1">
	                    	<h4 class="tag-h4 block-label">Interior Options</h4>
	                     </div>
	                     <div class="tag-col col-2">
	                     	<ul id="interior-options" class="block-list">
	
	                        	<li class="add-new-option" id="add-new-interior-option">
	                            	<span class="hover-blue" id="add-new-interior-item">Add New Option</span>
	                        		<div class="float-right">
	                                    <button class="add-button option-button" id="interior-add-button">+</button>
	                                    <input type="text" placeholder="" id="interior-input" class="tag-input option-input" />
	                                </div>
	                            </li>
	                        </ul>
	                     </div>
	             	</div>
	
	            </div>
	        	<div class="tag-frame invisible" id="tag-frame-3">
	                
	                <div class="tag-row row-1">
						<div class="tag-col col-1">
	                        <h4 class="tag-h4">Select a Discount</h4>
	                     </div>
	                     <div class="tag-col col-2">
							<ul class= "block-list" id="discountList">
															
							</ul>
	                     </div>
	             	</div>
	                <div class="tag-row row-2">
						<div class="tag-col col-1">
	                        <h4 class="tag-h4">Add New Discount</h4>
	                     </div>
						<div class="tag-col col-2">
			            	<ul class="list-vertical">
			                    <li>
			                        <label class="tag-label width-short" for="discountPrice">Amount</label>
			                        <input class="tag-input float-right" type="number" name="discountAmount" />
			                    </li>
			                    <li>
			                        <label class="tag-label width-short" for="discountType">Type</label>
			                        <select name="discountType" class="float-right tag-select">
			                            <option name="percentage">Percentage</option>
			                            <option name="value">Value</option>
			                        </select>
			                    </li>
			                    <li>
			                        <label class="tag-label width-short" for="discount">Discount</label>
			                        <input class="tag-input float-right" type="text" name="discount" />
			                    </li>
								<li>
									<button class="add-button discount-button float-right" id="discount-add-button">+</button>
								</li>
			                </ul>
						</div>
	                </div>
	            </div>
	        </form>
	    </div>
	</div>
</div>
	    <ul class="tag-nav-buttons" id="pdfControls">
	    	<li id="inspect" class="inline-block-li">
	    		<button class="tag-button black-text">Inspect</button>        
	    	</li>
	    	<li id="save" class="inline-block-li">
	    		<button class="tag-button black-text">Save</button>        
	    	</li>
	    	<li id="print" class="inline-block-li">
	    		<button class="tag-button black-text">Print</button>        
	    	</li>
	    	<li id="reset" class="inline-block-li">
	    		<button class="tag-button black-text">Reset</button>        
	    	</li>
		</ul>