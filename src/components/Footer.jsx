import React from 'react'

function Footer() {
  return (
    <>
      <footer className="content-footer footer bg-footer-theme mb-3">
        <div className="container-img-fluid  px-5">
          <div className="text-body d-flex justify-content-between align-items-center flex-column flex-md-row">
            <div className="mb-2 mb-md-0 text-center text-md-start">
              © Copyright. All Rights Reserved.
            </div>
            <div className="text-center d-flex justify-content-center">
  <a
    href="https://www.facebook.com/people/Menu-Mitra/61565082412478/"
    className="footer-link mx-3"
    target="_blank"
    rel="noopener noreferrer"
  >
    <i className="ri-facebook-fill fs-4 bx-sm" style={{ color: '#1877f2' }}></i> {/* Facebook Blue */}
  </a>
  <a
    href="https://www.instagram.com/menumitra/"
    className="footer-link mx-3"
    target="_blank"
    rel="noopener noreferrer"
  >
    <i className="" style={{ color: '#E4405F' }}></i> {/* Instagram Pink */}
  </a>
  <a
    href="https://www.youtube.com/@menumitra"
    className="footer-link mx-3"
    target="_blank"
    rel="noopener noreferrer"
  >
    <i className="bx bxl-youtube bx-sm" style={{ color: '#FF0000' }}></i> {/* YouTube Red */}
  </a>
  <a
    href="https://x.com/i/flow/login?redirect_after_login=%2FMenuMitra"
    className="footer-link mx-3"
    target="_blank"
    rel="noopener noreferrer"
  >
    <i className="bx bxl-twitter bx-sm" style={{ color: '#1DA1F2' }}></i> {/* Twitter Blue */}
  </a>
</div>

            <div className="d-flex justify-content-center align-items-center mt-3 mt-md-0">
              <i class="bx bxs-bolt fs-6 me-2"></i>
              Powered by
              <a
                className="ps-2 text-success "
                href="https://www.shekruweb.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Shekru Labs India Pvt. Ltd.
              </a>
              
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer