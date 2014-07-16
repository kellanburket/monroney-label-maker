<?php

class label_generator {

	private $pdf;

	public function __construct($label) {
		$this->pdf = new FPDF('P', 'in', 'A4');
		$this->pdf->AddPage();
		$this->pdf->SetFont('Helvetica', '', '16');
		
	}
	
	public function set_cell() {
		extract($_POST);
		$this->pdf->Cell($x, $y, $text, $border, 1, $alignment);
	}

	public function finish() {
		$this->pdf->Output();
	}
	
	public function set_label_color($args) {
		extract($_POST);
	}
	
	public function upload_logo($args) {
		extract($_POST);
	}
	
}
?>