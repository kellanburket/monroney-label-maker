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
?>
                        
                       

<div id="tag-generator">
	<div id="tag-preview">
    	<h2 class="tag-h2">Label Preview</h2>
        <div id="tag-preview-window">
        	<div id="tag-preview-header" class="tag-preview-section white-background">

            	<img id="dealershipLogo" class="invisible" />
                <h3 class="preview-h3 align-center" id="dealershipName"></h3>
                <h4 class="preview-h4 align-center" id="dealershipTagline"></h4>
                <h4 class="preview-h4 align-center" id="additionalInfo"></h4>
            </div>
            <div id="tag-preview-vitals" class="tag-preview-section white-background">
                <input class="preview-section-title color-white align-center" name="title_0" value="Consumer Protection Label" />
                <ul class="white-background">
                    <li><span class="preview-label">Stock No.:</span></li>
                    <li><span class="preview-label">VIN:</span><span class="preview-span" id="vin"></span></li>
                    <li><span class="preview-label">Make:</span><span class="preview-span" id="make"></span></li>
                    <li><span class="preview-label">Model:</span><span class="preview-span" id="model"></span></li>
                    <li><span class="preview-label">Year:</span><span class="preview-span" id="year"></span></li>
                    <li><span class="preview-label">MSRP:</span><span class="preview-span" id="msrp"></span></li>
				</ul>
            </div>
            <div id="tag-preview-info" class="tag-preview-section white-background">
				<input class="preview-section-title color-white align-center" name="title_1" value="Dealer Added Equipment & Services" />
                <ul class="white-background">
				</ul>
            </div>

            <div id="tag-preview-footer" class="tag-preview-section white-background">
				<input class="preview-section-title color-white align-center" name="title_2" value="Consult Free Gas Mileage Guide" />
           		<img id="customLabel" />
            </div>
        </div>
    </div>
	<div id="tag-options">
    	<h2 class="tag-h2">Label Options</h2>
    	<div class="tag-tabs">
        	<div class="tag-tab-holder inactive" id="tag-tab-holder-0">
            	<div class="tag-tab"></div>
                <span class="tag-tab-text">Branding Options</span>
            </div>
        	<div class="tag-tab-holder active" id="tag-tab-holder-1">
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
            <div class="tag-frame invisible" id="tag-frame-0">
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
                    	<h4 class="tag-h4">Logo Branding Option</h4>
                    	<?php echo $logo; ?>
                    	<input type="checkbox" name="toggleVisibility" />
                        <label for="toggleVisibility">Toggle Visibility</label>
                    </div>
                </div>
            	<div class="tag-row divider divider-bottom row-2">
                	<div class="tag-col col-1">
                    	<h4 class="tag-h4">Custom Text Branding Option</h4>
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
                <button class="tag-button next-button red-text">Next >></button>                
            </div>
        	<div class="tag-frame visible" id="tag-frame-1">
            	<div class="tag-row row-1">
                	<div class="tag-col col-1">
                    	<h4 class="tag-h4">Vehicle Information</h4>
						<fieldset name="vehicleConfig">
                            <ul class="tag-v-ul">
                                <li id="vehicleMakeConfig">
                                    <label class="tag-label width-short run-in" for="vehicleMake">Make</label>
                                    <button class="add-button run-in background-green">+</button>
                                    <button class="destroy-button run-in background-red">&ndash;</button>
                                    <input name="make" data-make="" type="text" class="run-in tag-input" value="Motorcycle" placeholder="[make]">
                                    <select class="tag-select float-right" name="make">
                                    	<option value='' disabled selected style='display:none;'>[Make]</option>
                                    </select>
                                </li>
                                <li id="vehicleModelConfig">
                                    <label class="tag-label width-short run-in" for="vehicleModel">Model</label>
                                    <button class="add-button run-in background-green">+</button>
                                    <button class="destroy-button run-in background-red">&ndash;</button>
                                    <input name="model" data-model="" type="text" class="run-in tag-input" value="Speedy" placeholder="[model]">
                                    <select class="tag-select float-right" name="model">
                                    	<option value='' disabled selected style='display:none;'>[Model]</option>
                                    </select>
                                </li>
                                <li id="vehicleYearConfig">
                                    <label class="tag-label width-short run-in" for="vehicleYear">Year</label>
                                    <button class="add-button run-in background-green">+</button>
                                    <button class="destroy-button run-in background-red">&ndash;</button>
                                    <input name="year" type="text" class="run-in tag-input" placeholder="[year]" value="2001">
                                    <select class="tag-select float-right" name="year">
                                    	<option value='' disabled selected style='display:none;'>[Year]</option>
                                    </select>
                                </li>
                                <li>
                                    <label class="tag-label width-short" for="vehicleTrime">Trim</label>
                                    <input class="tag-input float-right" type="text" name="vehicleTrim" />
                                </li>
                                <li>
                                    <label class="tag-label width-short" for="vehicleVIN">VIN</label>
                                    <fieldset name="vehicleVIN" class="float-right">
                                        
                                        <?php for ($i = 0; $i < 17; $i++) {?>
                                            <input class="char-input" maxlength="1" type="text" name="vehicleVIN[<?php echo $i; ?>]" />
                                        <? } ?>
                                    </fieldset>
                                </li>
                                <li>
                                    <label class="tag-label" for="vehicle-msrp">MSRP</label>
                                    <input class="tag-input" type="text" name="vehicle-msrp" />                                
                                </li>
                            </ul>
						</fieldset>
                    </div>
                </div>
            </div>
            <div class="tag-frame invisible" id="tag-frame-2">
				<div class="tag-row row-1">
                    <h4 class="tag-h4">Exterior Options</h4>
                    <div class="exterior-options"></div>		
				</div>
                <div class="tag-row row-2">
                	<h4 class="tag-h4">Interior Options</h4>
                    <div class="interior-options"></div>		
             	</div>
            </div>
        	<div class="tag-frame invisible" id="tag-frame-3">
            	<label class="tag-label" for="vehicle-discount-price">Discount Price</label>
               	<input class="tag-input" type="number" name="vehicle-discount-price" />
				<label class="tag-label" for="vehicle-discount-type">Discount Type</label>
            </div>
        </form>
    </div>
    <div class="tag-nav-buttons">
        <button class="tag-button black-text">Save</button>        
        <button class="tag-button black-text">Print</button>        
        <button class="tag-button black-text">Reset</button>        
	</div>
</div>