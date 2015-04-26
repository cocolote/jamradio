class JamsController < ApplicationController
  respond_to :json

  def index
    jams_songs = current_user.jams.map{ |j| { jam: j, songs: j.songs } }.compact
    guest_jams_songs = Guest.where(user: current_user).map { |g| { jam: g.jam, songs: g.jam.songs, user: g.jam.user } if g.jam }.compact
    respond_to do |format|
      format.json do
        render json: {
                 jams: { jams: jams_songs,
                         user: current_user,
                         guest_jams: guest_jams_songs }
                     }
      end
    end
  end

  def create
    @jam = Jam.new(jam_params)
    @jam.user = current_user
    if @jam.save
      params[:jam][:guests].each do |guest_id|
        user_guest = User.find(guest_id)
        Guest.create!(jam: @jam, user: user_guest)
      end
      respond_to do |format|
        format.json { render json: @jam }
      end
    else
      respond_to do |format|
        format.json { render json: { errors: @jam.errors.full_messages }, status: 403 }
      end
    end
  end

  def destroy
    jam = Jam.find(params[:id])
    if jam.user == current_user
      Jam.delete(params[:id])
      message = "The Jam was deleted"
    else
      guest = Guest.find_by(jam: jam, user: current_user)
      Guest.delete(guest)
      message = "You have leave the Jam"
    end
    respond_to do |format|
      format.json { render json: { message: message } }
    end
  end

  protected

  def jam_params
    params.require(:jam).permit(:name)
  end
end
