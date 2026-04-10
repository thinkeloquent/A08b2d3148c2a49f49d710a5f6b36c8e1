package extractimports

import "errors"

var (
	ErrParse       = errors.New("parse error")
	ErrUnsupported = errors.New("unsupported syntax")
)
