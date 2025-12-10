package org.workshop.momentummosaicapp.utility.exception;

public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException() { super(); }
    public UnauthorizedException(String message) { super(message); }
}
